import { Prisma, UserRole } from "@prisma/client";

import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError
} from "../../../shared/errors";
import { AuthenticatedUser } from "../../../shared/types/auth.types";
import { PaginationQuery } from "../../../shared/types/pagination.types";
import { getPagination } from "../../../shared/utils/pagination";
import { hashPassword } from "../../auth/auth.utils";
import { studentRepository } from "../repository/student.repository";
import { CreateStudentInput, UpdateStudentInput } from "../types/student.types";

export const studentService = {
  async getAllStudents(actor: AuthenticatedUser, query: PaginationQuery) {
    const departmentId = await getStudentDepartmentScope(actor);
    const { skip, take } = getPagination(query);
    const [students, total] = await Promise.all([
      studentRepository.findAll({ departmentId, skip, take, search: query.search }),
      studentRepository.count({ departmentId, search: query.search })
    ]);

    return {
      data: students,
      meta: {
        page: query.page,
        limit: query.limit,
        total
      }
    };
  },

  async getStudentById(id: string, actor: AuthenticatedUser) {
    const student = await studentRepository.findById(id);

    if (!student) {
      throw new NotFoundError("Student not found");
    }

    await assertCanReadStudent(actor, student.departmentId);

    return student;
  },

  async createStudent(input: CreateStudentInput) {
    await ensureDepartmentExists(input.departmentId);
    await ensureEmailAvailable(input.email);
    await ensureStudentIdAvailable(input.studentId);

    const passwordHash = await hashPassword(input.password);

    return studentRepository.create(input, passwordHash);
  },

  async updateStudent(id: string, input: UpdateStudentInput) {
    const existingStudent = await getExistingStudent(id);

    if (input.departmentId) {
      await ensureDepartmentExists(input.departmentId);
    }

    if (input.email && input.email !== existingStudent.user.email) {
      await ensureEmailAvailable(input.email);
    }

    if (input.studentId && input.studentId !== existingStudent.studentId) {
      await ensureStudentIdAvailable(input.studentId);
    }

    const passwordHash = input.password ? await hashPassword(input.password) : undefined;

    try {
      return await studentRepository.update(id, input, passwordHash);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictError("Student email or student id already exists");
      }

      throw error;
    }
  },

  async deleteStudent(id: string) {
    await getExistingStudent(id);

    try {
      return await studentRepository.deactivate(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new ConflictError("Student cannot be deleted while related records exist");
      }

      throw error;
    }
  }
};

async function getExistingStudent(id: string) {
  const student = await studentRepository.findById(id);

  if (!student) {
    throw new NotFoundError("Student not found");
  }

  return student;
}

async function ensureDepartmentExists(departmentId: string): Promise<void> {
  const department = await studentRepository.findDepartmentById(departmentId);

  if (!department) {
    throw new BadRequestError("Department does not exist");
  }
}

async function ensureEmailAvailable(email: string): Promise<void> {
  const user = await studentRepository.findUserByEmail(email);

  if (user) {
    throw new ConflictError("Email already exists");
  }
}

async function ensureStudentIdAvailable(studentId: string): Promise<void> {
  const student = await studentRepository.findByStudentId(studentId);

  if (student) {
    throw new ConflictError("Student id already exists");
  }
}

async function getStudentDepartmentScope(actor: AuthenticatedUser): Promise<string | undefined> {
  if (actor.role === UserRole.ADMIN || actor.role === UserRole.OFFICE_STAFF) {
    return undefined;
  }

  if (actor.role !== UserRole.DEAN && actor.role !== UserRole.CHAIR) {
    throw new ForbiddenError("You do not have permission to view students");
  }

  const faculty = await studentRepository.findFacultyProfileByUserId(actor.id);

  if (!faculty) {
    throw new ForbiddenError("Department-scoped user has no faculty profile");
  }

  return faculty.departmentId;
}

async function assertCanReadStudent(actor: AuthenticatedUser, departmentId: string): Promise<void> {
  const scopedDepartmentId = await getStudentDepartmentScope(actor);

  if (scopedDepartmentId && scopedDepartmentId !== departmentId) {
    throw new ForbiddenError("You can only view students in your department");
  }
}

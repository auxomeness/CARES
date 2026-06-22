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
import { facultyRepository, roleForFacultyPosition } from "../repository/faculty.repository";
import { CreateFacultyInput, UpdateFacultyInput } from "../types/faculty.types";

export const facultyService = {
  async getAllFaculty(actor: AuthenticatedUser, query: PaginationQuery) {
    const departmentId = await getDepartmentScopeForActor(actor);
    const { skip, take } = getPagination(query);
    const [faculty, total] = await Promise.all([
      facultyRepository.findAll({ departmentId, skip, take, search: query.search }),
      facultyRepository.count({ departmentId, search: query.search })
    ]);

    return {
      data: faculty,
      meta: {
        page: query.page,
        limit: query.limit,
        total
      }
    };
  },

  async getFacultyById(id: string, actor: AuthenticatedUser) {
    const faculty = await facultyRepository.findById(id);

    if (!faculty) {
      throw new NotFoundError("Faculty member not found");
    }

    await assertCanReadFaculty(actor, faculty.departmentId);

    return faculty;
  },

  async createFaculty(input: CreateFacultyInput) {
    await ensureDepartmentExists(input.departmentId);
    await ensureEmailAvailable(input.email);
    await ensureEmployeeIdAvailable(input.employeeId);

    const passwordHash = await hashPassword(input.password);
    const role = roleForFacultyPosition(input.position);

    return facultyRepository.create(input, passwordHash, role);
  },

  async updateFaculty(id: string, input: UpdateFacultyInput) {
    const existingFaculty = await getExistingFaculty(id);

    if (input.departmentId) {
      await ensureDepartmentExists(input.departmentId);
    }

    if (input.email && input.email !== existingFaculty.user.email) {
      await ensureEmailAvailable(input.email);
    }

    if (input.employeeId && input.employeeId !== existingFaculty.employeeId) {
      await ensureEmployeeIdAvailable(input.employeeId);
    }

    const passwordHash = input.password ? await hashPassword(input.password) : undefined;
    const role = input.position ? roleForFacultyPosition(input.position) : undefined;

    try {
      return await facultyRepository.update(id, input, passwordHash, role);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictError("Faculty email or employee id already exists");
      }

      throw error;
    }
  },

  async deleteFaculty(id: string) {
    await getExistingFaculty(id);

    try {
      return await facultyRepository.deactivate(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new ConflictError("Faculty member cannot be deleted while related records exist");
      }

      throw error;
    }
  }
};

async function getExistingFaculty(id: string) {
  const faculty = await facultyRepository.findById(id);

  if (!faculty) {
    throw new NotFoundError("Faculty member not found");
  }

  return faculty;
}

async function ensureDepartmentExists(departmentId: string): Promise<void> {
  const department = await facultyRepository.findDepartmentById(departmentId);

  if (!department) {
    throw new BadRequestError("Department does not exist");
  }
}

async function ensureEmailAvailable(email: string): Promise<void> {
  const user = await facultyRepository.findUserByEmail(email);

  if (user) {
    throw new ConflictError("Email already exists");
  }
}

async function ensureEmployeeIdAvailable(employeeId: string): Promise<void> {
  const faculty = await facultyRepository.findByEmployeeId(employeeId);

  if (faculty) {
    throw new ConflictError("Employee id already exists");
  }
}

async function getDepartmentScopeForActor(actor: AuthenticatedUser): Promise<string | undefined> {
  if (actor.role !== UserRole.DEAN && actor.role !== UserRole.CHAIR) {
    return undefined;
  }

  const faculty = await facultyRepository.findByUserId(actor.id);

  if (!faculty) {
    throw new ForbiddenError("Department-scoped user has no faculty profile");
  }

  return faculty.departmentId;
}

async function assertCanReadFaculty(actor: AuthenticatedUser, departmentId: string): Promise<void> {
  const scopedDepartmentId = await getDepartmentScopeForActor(actor);

  if (scopedDepartmentId && scopedDepartmentId !== departmentId) {
    throw new ForbiddenError("You can only view faculty in your department");
  }
}

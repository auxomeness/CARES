import { Prisma, UserRole } from "@prisma/client";

import { prisma } from "../../../config/database";
import { CreateStudentInput, UpdateStudentInput } from "../types/student.types";

const studentInclude = {
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      middleName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  },
  department: true
} as const;

export const studentRepository = {
  findAll(input: { departmentId?: string; skip: number; take: number; search?: string }) {
    const where = buildStudentWhere(input.departmentId, input.search);

    return prisma.studentProfile.findMany({
      where,
      skip: input.skip,
      take: input.take,
      include: studentInclude,
      orderBy: [{ department: { name: "asc" } }, { user: { lastName: "asc" } }]
    });
  },

  count(input: { departmentId?: string; search?: string }) {
    return prisma.studentProfile.count({
      where: buildStudentWhere(input.departmentId, input.search)
    });
  },

  findById(id: string) {
    return prisma.studentProfile.findUnique({
      where: { id },
      include: studentInclude
    });
  },

  findByStudentId(studentId: string) {
    return prisma.studentProfile.findUnique({
      where: { studentId }
    });
  },

  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }
    });
  },

  findDepartmentById(departmentId: string) {
    return prisma.department.findUnique({
      where: { id: departmentId },
      select: { id: true }
    });
  },

  findFacultyProfileByUserId(userId: string) {
    return prisma.facultyProfile.findUnique({
      where: { userId },
      select: { departmentId: true }
    });
  },

  create(input: CreateStudentInput, passwordHash: string) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          password: passwordHash,
          firstName: input.firstName,
          middleName: input.middleName,
          lastName: input.lastName,
          role: UserRole.STUDENT,
          isActive: true
        }
      });

      return tx.studentProfile.create({
        data: {
          userId: user.id,
          studentId: input.studentId,
          course: input.course,
          yearLevel: input.yearLevel,
          departmentId: input.departmentId
        },
        include: studentInclude
      });
    });
  },

  update(id: string, input: UpdateStudentInput, passwordHash?: string) {
    return prisma.$transaction(async (tx) => {
      const student = await tx.studentProfile.findUniqueOrThrow({
        where: { id },
        select: { userId: true }
      });

      const userData: Prisma.UserUpdateInput = {};

      if (input.email) userData.email = input.email;
      if (input.firstName) userData.firstName = input.firstName;
      if (input.middleName !== undefined) userData.middleName = input.middleName;
      if (input.lastName) userData.lastName = input.lastName;
      if (passwordHash) userData.password = passwordHash;

      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id: student.userId },
          data: userData
        });
      }

      return tx.studentProfile.update({
        where: { id },
        data: {
          studentId: input.studentId,
          course: input.course,
          yearLevel: input.yearLevel,
          departmentId: input.departmentId
        },
        include: studentInclude
      });
    });
  },

  deactivate(id: string) {
    return prisma.$transaction(async (tx) => {
      const student = await tx.studentProfile.findUniqueOrThrow({
        where: { id },
        include: studentInclude
      });

      await tx.user.update({
        where: { id: student.userId },
        data: { isActive: false }
      });

      return tx.studentProfile.findUniqueOrThrow({
        where: { id },
        include: studentInclude
      });
    });
  }
};

function buildStudentWhere(
  departmentId?: string,
  search?: string
): Prisma.StudentProfileWhereInput | undefined {
  const filters: Prisma.StudentProfileWhereInput[] = [];

  filters.push({ user: { isActive: true } });

  if (departmentId) {
    filters.push({ departmentId });
  }

  if (search) {
    filters.push({
      OR: [
        { studentId: { contains: search, mode: "insensitive" } },
        { course: { contains: search, mode: "insensitive" } },
        { department: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { middleName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } }
      ]
    });
  }

  if (filters.length === 0) {
    return undefined;
  }

  return { AND: filters };
}

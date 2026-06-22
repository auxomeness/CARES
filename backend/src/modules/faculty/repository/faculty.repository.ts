import { FacultyPosition, Prisma, UserRole } from "@prisma/client";

import { prisma } from "../../../config/database";
import { CreateFacultyInput, UpdateFacultyInput } from "../types/faculty.types";

const facultyInclude = {
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

export const facultyRepository = {
  findAll(input: { departmentId?: string; skip: number; take: number; search?: string }) {
    const where = buildFacultyWhere(input.departmentId, input.search);

    return prisma.facultyProfile.findMany({
      where,
      skip: input.skip,
      take: input.take,
      include: facultyInclude,
      orderBy: [{ department: { name: "asc" } }, { position: "asc" }, { user: { lastName: "asc" } }]
    });
  },

  count(input: { departmentId?: string; search?: string }) {
    return prisma.facultyProfile.count({
      where: buildFacultyWhere(input.departmentId, input.search)
    });
  },

  findById(id: string) {
    return prisma.facultyProfile.findUnique({
      where: { id },
      include: facultyInclude
    });
  },

  findByUserId(userId: string) {
    return prisma.facultyProfile.findUnique({
      where: { userId },
      include: facultyInclude
    });
  },

  findByEmployeeId(employeeId: string) {
    return prisma.facultyProfile.findUnique({
      where: { employeeId }
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

  create(input: CreateFacultyInput, passwordHash: string, role: UserRole) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          password: passwordHash,
          firstName: input.firstName,
          middleName: input.middleName,
          lastName: input.lastName,
          role,
          isActive: true
        }
      });

      return tx.facultyProfile.create({
        data: {
          userId: user.id,
          employeeId: input.employeeId,
          departmentId: input.departmentId,
          position: input.position
        },
        include: facultyInclude
      });
    });
  },

  update(id: string, input: UpdateFacultyInput, passwordHash?: string, role?: UserRole) {
    return prisma.$transaction(async (tx) => {
      const faculty = await tx.facultyProfile.findUniqueOrThrow({
        where: { id },
        select: { userId: true }
      });

      const userData: Prisma.UserUpdateInput = {};

      if (input.email) userData.email = input.email;
      if (input.firstName) userData.firstName = input.firstName;
      if (input.middleName !== undefined) userData.middleName = input.middleName;
      if (input.lastName) userData.lastName = input.lastName;
      if (passwordHash) userData.password = passwordHash;
      if (role) userData.role = role;

      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id: faculty.userId },
          data: userData
        });
      }

      return tx.facultyProfile.update({
        where: { id },
        data: {
          employeeId: input.employeeId,
          departmentId: input.departmentId,
          position: input.position
        },
        include: facultyInclude
      });
    });
  },

  deactivate(id: string) {
    return prisma.$transaction(async (tx) => {
      const faculty = await tx.facultyProfile.findUniqueOrThrow({
        where: { id },
        include: facultyInclude
      });

      await tx.user.update({
        where: { id: faculty.userId },
        data: { isActive: false }
      });

      return tx.facultyProfile.findUniqueOrThrow({
        where: { id },
        include: facultyInclude
      });
    });
  }
};

export function roleForFacultyPosition(position: FacultyPosition): UserRole {
  if (position === FacultyPosition.DEAN) return UserRole.DEAN;
  if (position === FacultyPosition.CHAIR) return UserRole.CHAIR;
  return UserRole.PROFESSOR;
}

function buildFacultyWhere(
  departmentId?: string,
  search?: string
): Prisma.FacultyProfileWhereInput | undefined {
  const filters: Prisma.FacultyProfileWhereInput[] = [];

  filters.push({ user: { isActive: true } });

  if (departmentId) {
    filters.push({ departmentId });
  }

  const position = parseFacultyPositionSearch(search);

  if (search) {
    filters.push({
      OR: [
        { employeeId: { contains: search, mode: "insensitive" } },
        ...(position ? [{ position: { equals: position } }] : []),
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

function parseFacultyPositionSearch(search?: string): FacultyPosition | undefined {
  const normalizedSearch = search?.toUpperCase();

  if (
    normalizedSearch === FacultyPosition.DEAN ||
    normalizedSearch === FacultyPosition.CHAIR ||
    normalizedSearch === FacultyPosition.PROFESSOR
  ) {
    return normalizedSearch;
  }

  return undefined;
}

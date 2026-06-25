import { Prisma } from "@prisma/client";

import { prisma } from "../../../config/database";

export const directoryRepository = {
  findFaculty(input: { search?: string; skip: number; take: number }) {
    return prisma.facultyProfile.findMany({
      where: {
        user: { isActive: true },
        ...(input.search ? { OR: buildFacultySearch(input.search) } : {})
      },
      skip: input.skip,
      take: input.take,
      select: {
        id: true,
        position: true,
        user: {
          select: {
            firstName: true,
            middleName: true,
            lastName: true
          }
        },
        department: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [{ department: { name: "asc" } }, { position: "asc" }, { user: { lastName: "asc" } }]
    });
  },

  countFaculty(search?: string) {
    return prisma.facultyProfile.count({
      where: {
        user: { isActive: true },
        ...(search ? { OR: buildFacultySearch(search) } : {})
      }
    });
  },

  findOffices(input: { search?: string; skip: number; take: number }) {
    return prisma.office.findMany({
      where: input.search
        ? {
            OR: [
              { name: { contains: input.search, mode: "insensitive" } },
              { email: { contains: input.search, mode: "insensitive" } },
              { location: { contains: input.search, mode: "insensitive" } }
            ]
          }
        : undefined,
      skip: input.skip,
      take: input.take,
      select: {
        id: true,
        name: true
      },
      orderBy: { name: "asc" }
    });
  },

  countOffices(search?: string) {
    return prisma.office.count({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } }
            ]
          }
        : undefined
    });
  },

  findDepartments(input: { search?: string; skip: number; take: number }) {
    return prisma.department.findMany({
      where: input.search
        ? {
            OR: [
              { name: { contains: input.search, mode: "insensitive" } },
              { email: { contains: input.search, mode: "insensitive" } },
              { location: { contains: input.search, mode: "insensitive" } }
            ]
          }
        : undefined,
      skip: input.skip,
      take: input.take,
      select: {
        id: true,
        name: true
      },
      orderBy: { name: "asc" }
    });
  },

  countDepartments(search?: string) {
    return prisma.department.count({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } }
            ]
          }
        : undefined
    });
  }
};

function buildFacultySearch(search: string): Prisma.FacultyProfileWhereInput[] {
  return [
    { employeeId: { contains: search, mode: "insensitive" } },
    { department: { name: { contains: search, mode: "insensitive" } } },
    { user: { firstName: { contains: search, mode: "insensitive" } } },
    { user: { middleName: { contains: search, mode: "insensitive" } } },
    { user: { lastName: { contains: search, mode: "insensitive" } } }
  ];
}

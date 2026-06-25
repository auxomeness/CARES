import { Prisma } from "@prisma/client";

import { prisma } from "../../../config/database";

export const directoryRepository = {
  findFaculty(search?: string) {
    return prisma.facultyProfile.findMany({
      where: {
        user: { isActive: true },
        ...(search ? { OR: buildFacultySearch(search) } : {})
      },
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

  findOffices(search?: string) {
    return prisma.office.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } }
            ]
          }
        : undefined,
      select: {
        id: true,
        name: true
      },
      orderBy: { name: "asc" }
    });
  },

  findDepartments(search?: string) {
    return prisma.department.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } }
            ]
          }
        : undefined,
      select: {
        id: true,
        name: true
      },
      orderBy: { name: "asc" }
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

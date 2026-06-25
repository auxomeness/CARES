import { Prisma } from "@prisma/client";

import { prisma } from "../../../config/database";
import {
  CreateDepartmentInput,
  UpdateDepartmentInput
} from "../types/department.types";

export const departmentRepository = {
  findAll(input: { skip: number; take: number; search?: string }) {
    const where = buildDepartmentWhere(input.search);

    return prisma.department.findMany({
      where,
      skip: input.skip,
      take: input.take,
      orderBy: { name: "asc" },
      include: {
        faculty: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                middleName: true,
                lastName: true,
                role: true,
                isActive: true
              }
            }
          },
          orderBy: [{ position: "asc" }, { user: { lastName: "asc" } }]
        }
      }
    });
  },

  count(search?: string) {
    return prisma.department.count({
      where: buildDepartmentWhere(search)
    });
  },

  findById(id: string) {
    return prisma.department.findUnique({
      where: { id },
      include: {
        faculty: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                middleName: true,
                lastName: true,
                role: true,
                isActive: true
              }
            }
          },
          orderBy: [{ position: "asc" }, { user: { lastName: "asc" } }]
        }
      }
    });
  },

  findByName(name: string) {
    return prisma.department.findUnique({
      where: { name }
    });
  },

  findByEmail(email: string) {
    return prisma.department.findFirst({
      where: { email }
    });
  },

  create(input: CreateDepartmentInput) {
    return prisma.department.create({
      data: input
    });
  },

  update(id: string, input: UpdateDepartmentInput) {
    return prisma.department.update({
      where: { id },
      data: input
    });
  },

  delete(id: string) {
    return prisma.department.delete({
      where: { id }
    });
  }
};

function buildDepartmentWhere(search?: string): Prisma.DepartmentWhereInput | undefined {
  if (!search) {
    return undefined;
  }

  return {
    OR: [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } }
    ]
  };
}

import { Prisma } from "@prisma/client";

import { prisma } from "../../../config/database";
import { CreateOfficeInput, UpdateOfficeInput } from "../types/office.types";

export const officeRepository = {
  findAll(input: { skip: number; take: number; search?: string }) {
    const where = buildOfficeWhere(input.search);

    return prisma.office.findMany({
      where,
      skip: input.skip,
      take: input.take,
      orderBy: { name: "asc" }
    });
  },

  count(search?: string) {
    return prisma.office.count({
      where: buildOfficeWhere(search)
    });
  },

  findById(id: string) {
    return prisma.office.findUnique({
      where: { id }
    });
  },

  findByName(name: string) {
    return prisma.office.findUnique({
      where: { name }
    });
  },

  findByEmail(email: string) {
    return prisma.office.findFirst({
      where: { email }
    });
  },

  create(input: CreateOfficeInput) {
    return prisma.office.create({
      data: input
    });
  },

  update(id: string, input: UpdateOfficeInput) {
    return prisma.office.update({
      where: { id },
      data: input
    });
  },

  delete(id: string) {
    return prisma.office.delete({
      where: { id }
    });
  }
};

function buildOfficeWhere(search?: string): Prisma.OfficeWhereInput | undefined {
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

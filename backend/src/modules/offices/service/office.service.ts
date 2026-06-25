import { Prisma } from "@prisma/client";

import { ConflictError, NotFoundError } from "../../../shared/errors";
import { PaginationQuery } from "../../../shared/types/pagination.types";
import { getPagination } from "../../../shared/utils/pagination";
import { invalidateCachePattern } from "../../../shared/utils/cache";
import { CreateOfficeInput, UpdateOfficeInput } from "../types/office.types";
import { officeRepository } from "../repository/office.repository";

export const officeService = {
  async getAllOffices(query: PaginationQuery) {
    const { skip, take } = getPagination(query);
    const [offices, total] = await Promise.all([
      officeRepository.findAll({ skip, take, search: query.search }),
      officeRepository.count(query.search)
    ]);

    return {
      data: offices,
      meta: {
        page: query.page,
        limit: query.limit,
        total
      }
    };
  },

  async getOfficeById(id: string) {
    const office = await officeRepository.findById(id);

    if (!office) {
      throw new NotFoundError("Office not found");
    }

    return office;
  },

  async createOffice(input: CreateOfficeInput) {
    await ensureOfficeNameAvailable(input.name);
    await ensureOfficeEmailAvailable(input.email);

    const office = await officeRepository.create(input);
    await invalidateCachePattern("directory:offices:*");
    return office;
  },

  async updateOffice(id: string, input: UpdateOfficeInput) {
    const existingOffice = await this.getOfficeById(id);

    if (input.name && input.name !== existingOffice.name) {
      await ensureOfficeNameAvailable(input.name);
    }

    if (input.email && input.email !== existingOffice.email) {
      await ensureOfficeEmailAvailable(input.email);
    }

    const office = await officeRepository.update(id, input);
    await invalidateCachePattern("directory:offices:*");
    return office;
  },

  async deleteOffice(id: string) {
    await this.getOfficeById(id);

    try {
      const office = await officeRepository.delete(id);
      await invalidateCachePattern("directory:offices:*");
      return office;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new ConflictError("Office cannot be deleted while related records exist");
      }

      throw error;
    }
  }
};

async function ensureOfficeNameAvailable(name: string): Promise<void> {
  const office = await officeRepository.findByName(name);

  if (office) {
    throw new ConflictError("Office name already exists");
  }
}

async function ensureOfficeEmailAvailable(email: string): Promise<void> {
  const office = await officeRepository.findByEmail(email);

  if (office) {
    throw new ConflictError("Office email already exists");
  }
}

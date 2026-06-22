import { Prisma } from "@prisma/client";

import { ConflictError, NotFoundError } from "../../../shared/errors";
import { PaginationQuery } from "../../../shared/types/pagination.types";
import { getPagination } from "../../../shared/utils/pagination";
import {
  CreateDepartmentInput,
  UpdateDepartmentInput
} from "../types/department.types";
import { departmentRepository } from "../repository/department.repository";

export const departmentService = {
  async getAllDepartments(query: PaginationQuery) {
    const { skip, take } = getPagination(query);
    const [departments, total] = await Promise.all([
      departmentRepository.findAll({ skip, take, search: query.search }),
      departmentRepository.count(query.search)
    ]);

    return {
      data: departments,
      meta: {
        page: query.page,
        limit: query.limit,
        total
      }
    };
  },

  async getDepartmentById(id: string) {
    const department = await departmentRepository.findById(id);

    if (!department) {
      throw new NotFoundError("Department not found");
    }

    return department;
  },

  async createDepartment(input: CreateDepartmentInput) {
    await ensureDepartmentNameAvailable(input.name);
    await ensureDepartmentEmailAvailable(input.email);

    return departmentRepository.create(input);
  },

  async updateDepartment(id: string, input: UpdateDepartmentInput) {
    const existingDepartment = await this.getDepartmentById(id);

    if (input.name && input.name !== existingDepartment.name) {
      await ensureDepartmentNameAvailable(input.name);
    }

    if (input.email && input.email !== existingDepartment.email) {
      await ensureDepartmentEmailAvailable(input.email);
    }

    return departmentRepository.update(id, input);
  },

  async deleteDepartment(id: string) {
    await this.getDepartmentById(id);

    try {
      return await departmentRepository.delete(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new ConflictError("Department cannot be deleted while related records exist");
      }

      throw error;
    }
  }
};

async function ensureDepartmentNameAvailable(name: string): Promise<void> {
  const department = await departmentRepository.findByName(name);

  if (department) {
    throw new ConflictError("Department name already exists");
  }
}

async function ensureDepartmentEmailAvailable(email: string): Promise<void> {
  const department = await departmentRepository.findByEmail(email);

  if (department) {
    throw new ConflictError("Department email already exists");
  }
}

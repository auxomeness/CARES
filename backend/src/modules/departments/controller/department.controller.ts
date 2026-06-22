import { Request, Response } from "express";

import { PaginationQuery } from "../../../shared/types/pagination.types";
import {
  createdResponse,
  paginatedResponse,
  successResponse
} from "../../../shared/utils/apiResponse";
import { departmentService } from "../service/department.service";
import {
  CreateDepartmentInput,
  UpdateDepartmentInput
} from "../types/department.types";

export const departmentController = {
  async getAllDepartments(req: Request, res: Response): Promise<Response> {
    const result = await departmentService.getAllDepartments(req.query as unknown as PaginationQuery);

    return paginatedResponse(res, "Departments retrieved successfully", result.data, result.meta);
  },

  async getDepartmentById(req: Request, res: Response): Promise<Response> {
    const department = await departmentService.getDepartmentById(req.params.id);

    return successResponse(res, "Department retrieved successfully", { department });
  },

  async createDepartment(req: Request, res: Response): Promise<Response> {
    const department = await departmentService.createDepartment(req.body as CreateDepartmentInput);

    return createdResponse(res, "Department created successfully", { department });
  },

  async updateDepartment(req: Request, res: Response): Promise<Response> {
    const department = await departmentService.updateDepartment(
      req.params.id,
      req.body as UpdateDepartmentInput
    );

    return successResponse(res, "Department updated successfully", { department });
  },

  async deleteDepartment(req: Request, res: Response): Promise<Response> {
    const department = await departmentService.deleteDepartment(req.params.id);

    return successResponse(res, "Department deleted successfully", { department });
  }
};

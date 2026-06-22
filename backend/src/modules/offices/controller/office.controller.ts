import { Request, Response } from "express";

import { PaginationQuery } from "../../../shared/types/pagination.types";
import {
  createdResponse,
  paginatedResponse,
  successResponse
} from "../../../shared/utils/apiResponse";
import { CreateOfficeInput, UpdateOfficeInput } from "../types/office.types";
import { officeService } from "../service/office.service";

export const officeController = {
  async getAllOffices(req: Request, res: Response): Promise<Response> {
    const result = await officeService.getAllOffices(req.query as unknown as PaginationQuery);

    return paginatedResponse(res, "Offices retrieved successfully", result.data, result.meta);
  },

  async getOfficeById(req: Request, res: Response): Promise<Response> {
    const office = await officeService.getOfficeById(req.params.id);

    return successResponse(res, "Office retrieved successfully", { office });
  },

  async createOffice(req: Request, res: Response): Promise<Response> {
    const office = await officeService.createOffice(req.body as CreateOfficeInput);

    return createdResponse(res, "Office created successfully", { office });
  },

  async updateOffice(req: Request, res: Response): Promise<Response> {
    const office = await officeService.updateOffice(req.params.id, req.body as UpdateOfficeInput);

    return successResponse(res, "Office updated successfully", { office });
  },

  async deleteOffice(req: Request, res: Response): Promise<Response> {
    const office = await officeService.deleteOffice(req.params.id);

    return successResponse(res, "Office deleted successfully", { office });
  }
};

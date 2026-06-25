import { Request, Response } from "express";

import { PaginationQuery } from "../../../shared/types/pagination.types";
import { paginatedResponse } from "../../../shared/utils/apiResponse";
import { directoryService } from "../service/directory.service";

export const directoryController = {
  async getFacultyDirectory(req: Request, res: Response): Promise<Response> {
    const result = await directoryService.getFacultyDirectory(
      req.query as unknown as PaginationQuery
    );

    return paginatedResponse(
      res,
      "Faculty directory retrieved successfully",
      result.data,
      result.meta
    );
  },

  async getOfficeDirectory(req: Request, res: Response): Promise<Response> {
    const result = await directoryService.getOfficeDirectory(
      req.query as unknown as PaginationQuery
    );

    return paginatedResponse(
      res,
      "Office directory retrieved successfully",
      result.data,
      result.meta
    );
  },

  async getDepartmentDirectory(req: Request, res: Response): Promise<Response> {
    const result = await directoryService.getDepartmentDirectory(
      req.query as unknown as PaginationQuery
    );

    return paginatedResponse(
      res,
      "Department directory retrieved successfully",
      result.data,
      result.meta
    );
  }
};

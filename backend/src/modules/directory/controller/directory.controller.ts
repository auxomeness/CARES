import { Request, Response } from "express";

import { successResponse } from "../../../shared/utils/apiResponse";
import { directoryService } from "../service/directory.service";

export const directoryController = {
  async getFacultyDirectory(req: Request, res: Response): Promise<Response> {
    const faculty = await directoryService.getFacultyDirectory(req.query.search as string | undefined);

    return successResponse(res, "Faculty directory retrieved successfully", faculty);
  },

  async getOfficeDirectory(req: Request, res: Response): Promise<Response> {
    const offices = await directoryService.getOfficeDirectory(req.query.search as string | undefined);

    return successResponse(res, "Office directory retrieved successfully", offices);
  },

  async getDepartmentDirectory(req: Request, res: Response): Promise<Response> {
    const departments = await directoryService.getDepartmentDirectory(
      req.query.search as string | undefined
    );

    return successResponse(res, "Department directory retrieved successfully", departments);
  }
};

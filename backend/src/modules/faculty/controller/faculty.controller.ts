import { Request, Response } from "express";

import { UnauthorizedError } from "../../../shared/errors";
import { PaginationQuery } from "../../../shared/types/pagination.types";
import {
  createdResponse,
  paginatedResponse,
  successResponse
} from "../../../shared/utils/apiResponse";
import { facultyService } from "../service/faculty.service";
import { CreateFacultyInput, UpdateFacultyInput } from "../types/faculty.types";

export const facultyController = {
  async getAllFaculty(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const result = await facultyService.getAllFaculty(
      req.user,
      req.query as unknown as PaginationQuery
    );

    return paginatedResponse(res, "Faculty retrieved successfully", result.data, result.meta);
  },

  async getFacultyById(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const faculty = await facultyService.getFacultyById(req.params.id, req.user);

    return successResponse(res, "Faculty member retrieved successfully", { faculty });
  },

  async createFaculty(req: Request, res: Response): Promise<Response> {
    const faculty = await facultyService.createFaculty(req.body as CreateFacultyInput);

    return createdResponse(res, "Faculty member created successfully", { faculty });
  },

  async updateFaculty(req: Request, res: Response): Promise<Response> {
    const faculty = await facultyService.updateFaculty(
      req.params.id,
      req.body as UpdateFacultyInput
    );

    return successResponse(res, "Faculty member updated successfully", { faculty });
  },

  async deleteFaculty(req: Request, res: Response): Promise<Response> {
    const faculty = await facultyService.deleteFaculty(req.params.id);

    return successResponse(res, "Faculty member deactivated successfully", { faculty });
  }
};

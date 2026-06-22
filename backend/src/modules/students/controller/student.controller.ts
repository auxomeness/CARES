import { Request, Response } from "express";

import { UnauthorizedError } from "../../../shared/errors";
import { PaginationQuery } from "../../../shared/types/pagination.types";
import {
  createdResponse,
  paginatedResponse,
  successResponse
} from "../../../shared/utils/apiResponse";
import { studentService } from "../service/student.service";
import { CreateStudentInput, UpdateStudentInput } from "../types/student.types";

export const studentController = {
  async getAllStudents(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const result = await studentService.getAllStudents(
      req.user,
      req.query as unknown as PaginationQuery
    );

    return paginatedResponse(res, "Students retrieved successfully", result.data, result.meta);
  },

  async getStudentById(req: Request, res: Response): Promise<Response> {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const student = await studentService.getStudentById(req.params.id, req.user);

    return successResponse(res, "Student retrieved successfully", { student });
  },

  async createStudent(req: Request, res: Response): Promise<Response> {
    const student = await studentService.createStudent(req.body as CreateStudentInput);

    return createdResponse(res, "Student created successfully", { student });
  },

  async updateStudent(req: Request, res: Response): Promise<Response> {
    const student = await studentService.updateStudent(
      req.params.id,
      req.body as UpdateStudentInput
    );

    return successResponse(res, "Student updated successfully", { student });
  },

  async deleteStudent(req: Request, res: Response): Promise<Response> {
    const student = await studentService.deleteStudent(req.params.id);

    return successResponse(res, "Student deactivated successfully", { student });
  }
};

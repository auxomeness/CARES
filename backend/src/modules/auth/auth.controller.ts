import { Request, Response } from "express";

import { UnauthorizedError } from "../../shared/errors";
import { createdResponse, successResponse } from "../../shared/utils/apiResponse";
import { authService } from "./auth.service";
import { LoginInput, RegisterStudentInput } from "./auth.types";

export const authController = {
  async register(req: Request, res: Response): Promise<Response> {
    const result = await authService.registerStudent(req.body as RegisterStudentInput);
    return createdResponse(res, "Registration successful", result);
  },

  async departments(_req: Request, res: Response): Promise<Response> {
    const departments = await authService.listRegistrationDepartments();
    return successResponse(res, "Registration departments retrieved", { departments });
  },

  async login(req: Request, res: Response): Promise<Response> {
    const result = await authService.login(req.body as LoginInput);

    return successResponse(res, "Login successful", result);
  },

  async me(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const user = await authService.getCurrentUser(req.user);

    return successResponse(res, "Current user retrieved successfully", { user });
  }
};

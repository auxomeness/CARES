import { Request, Response } from "express";

import { UnauthorizedError } from "../../shared/errors";
import { createdResponse, successResponse } from "../../shared/utils/apiResponse";
import { bootstrapService } from "../bootstrap";
import { authService } from "./auth.service";
import { LoginInput, RegisterStudentInput } from "./auth.types";

export const authController = {
  async register(req: Request, res: Response): Promise<Response> {
    const result = await authService.registerStudent(req.body as RegisterStudentInput);
    const bootstrap = await bootstrapService.getBootstrap({ id: result.user.id, role: result.user.role });
    return createdResponse(res, "Registration successful", { ...result, bootstrap });
  },

  async departments(_req: Request, res: Response): Promise<Response> {
    const departments = await authService.listRegistrationDepartments();
    return successResponse(res, "Registration departments retrieved", { departments });
  },

  async login(req: Request, res: Response): Promise<Response> {
    const result = await authService.login(req.body as LoginInput);
    const bootstrap = await bootstrapService.getBootstrap({ id: result.user.id, role: result.user.role });

    return successResponse(res, "Login successful", { ...result, bootstrap });
  },

  async me(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const user = await authService.getCurrentUser(req.user);

    return successResponse(res, "Current user retrieved successfully", { user });
  }
};

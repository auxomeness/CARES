import { Request, Response } from "express";

import { UnauthorizedError } from "../../shared/errors";
import { successResponse } from "../../shared/utils/apiResponse";
import { authService } from "./auth.service";
import { LoginInput } from "./auth.types";

export const authController = {
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

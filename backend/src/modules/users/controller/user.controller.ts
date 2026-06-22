import { Request, Response } from "express";

import { UnauthorizedError } from "../../../shared/errors";
import { successResponse } from "../../../shared/utils/apiResponse";
import { userService } from "../service/user.service";

export const userController = {
  async me(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const user = await userService.getCurrentUserProfile(req.user);

    return successResponse(res, "User profile retrieved successfully", { user });
  }
};

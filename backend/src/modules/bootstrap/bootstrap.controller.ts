import { Request, Response } from "express";

import { UnauthorizedError } from "../../shared/errors";
import { successResponse } from "../../shared/utils/apiResponse";
import { bootstrapService } from "./bootstrap.service";

export const bootstrapController = {
  async getBootstrap(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const bootstrap = await bootstrapService.getBootstrap(req.user);
    return successResponse(res, "Bootstrap data retrieved", bootstrap);
  }
};

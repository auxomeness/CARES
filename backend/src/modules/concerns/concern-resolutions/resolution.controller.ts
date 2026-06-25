import { Request, Response } from "express";

import { createdResponse, successResponse } from "../../../shared/utils/apiResponse";
import { requireActor } from "../controller/concern.controller";
import { CreateResolutionInput, RejectResolutionInput } from "../types/concern.types";
import { resolutionService } from "./resolution.service";

export const resolutionController = {
  async createResolution(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const concern = await resolutionService.createResolution(
      req.params.id,
      req.body as CreateResolutionInput,
      actor
    );
    return createdResponse(res, "Resolution report submitted successfully", {
      concern
    });
  },

  async confirmResolution(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const concern = await resolutionService.confirmResolution(req.params.id, actor);
    return successResponse(res, "Resolution confirmed successfully", { concern });
  },

  async rejectResolution(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const concern = await resolutionService.rejectResolution(
      req.params.id,
      req.body as RejectResolutionInput,
      actor
    );
    return successResponse(res, "Resolution rejected and concern reopened", {
      concern
    });
  }
};

import { Request, Response } from "express";

import { successResponse } from "../../../shared/utils/apiResponse";
import { requireActor } from "../controller/concern.controller";
import { timelineService } from "./timeline.service";

export const timelineController = {
  async getTimeline(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const timeline = await timelineService.getTimeline(req.params.id, actor);
    return successResponse(res, "Concern timeline retrieved successfully", {
      timeline
    });
  }
};

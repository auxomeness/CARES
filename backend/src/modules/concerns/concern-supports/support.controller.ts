import { Request, Response } from "express";

import { createdResponse } from "../../../shared/utils/apiResponse";
import { requireActor } from "../controller/concern.controller";
import { supportService } from "./support.service";

export const supportController = {
  async addSupport(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const support = await supportService.addSupport(req.params.id, actor);
    return createdResponse(res, "Concern support recorded successfully", { support });
  }
};

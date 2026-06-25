import { Request, Response } from "express";

import { successResponse } from "../../../shared/utils/apiResponse";
import { requireActor } from "../controller/concern.controller";
import { TransferConcernInput } from "../types/concern.types";
import { transferService } from "./transfer.service";

export const transferController = {
  async transferConcern(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const concern = await transferService.transferConcern(
      req.params.id,
      req.body as TransferConcernInput,
      actor
    );
    return successResponse(res, "Concern transferred successfully", { concern });
  }
};

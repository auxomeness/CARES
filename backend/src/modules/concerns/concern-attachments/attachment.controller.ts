import { Request, Response } from "express";

import { BadRequestError } from "../../../shared/errors";
import { createdResponse } from "../../../shared/utils/apiResponse";
import { requireActor } from "../controller/concern.controller";
import { attachmentService } from "./attachment.service";

export const attachmentController = {
  async uploadImage(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    if (!req.file) throw new BadRequestError("Image file is required");

    const attachment = await attachmentService.uploadImage(req.params.id, req.file, actor);
    return createdResponse(res, "Concern image uploaded successfully", {
      attachment
    });
  }
};

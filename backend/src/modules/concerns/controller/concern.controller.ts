import { Request, Response } from "express";

import { UnauthorizedError } from "../../../shared/errors";
import {
  createdResponse,
  paginatedResponse,
  successResponse
} from "../../../shared/utils/apiResponse";
import { concernService } from "../service/concern.service";
import {
  ConcernListQuery,
  CreateConcernInput,
  UpdateConcernStatusInput
} from "../types/concern.types";

export const concernController = {
  async createConcern(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const concern = await concernService.createConcern(req.body as CreateConcernInput, actor);
    return createdResponse(res, "Concern submitted successfully", { concern });
  },

  async getConcerns(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const result = await concernService.getConcerns(
      actor,
      req.query as unknown as ConcernListQuery
    );
    return paginatedResponse(res, "Concerns retrieved successfully", result.data, result.meta);
  },

  async getConcernById(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const concern = await concernService.getConcernById(req.params.id, actor);
    return successResponse(res, "Concern retrieved successfully", { concern });
  },

  async updateConcernStatus(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const concern = await concernService.updateConcernStatus(
      req.params.id,
      req.body as UpdateConcernStatusInput,
      actor
    );
    return successResponse(res, "Concern status updated successfully", { concern });
  }
};

export function requireActor(req: Request) {
  if (!req.user) throw new UnauthorizedError("Authentication required");
  return req.user;
}

import { Request, Response } from "express";

import { createdResponse, successResponse } from "../../../shared/utils/apiResponse";
import { requireActor } from "../controller/appointment.controller";
import {
  AvailabilityLookupQuery,
  BookableSlotsQuery,
  CreateAvailabilityInput,
  UpdateAvailabilityInput
} from "../types/appointment.types";
import { availabilityService } from "./availability.service";

export const availabilityController = {
  async createAvailability(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const availability = await availabilityService.createAvailability(
      req.body as CreateAvailabilityInput,
      actor
    );
    return createdResponse(res, "Availability schedule created successfully", {
      availability
    });
  },

  async getAvailability(req: Request, res: Response): Promise<Response> {
    const availability = await availabilityService.getAvailability(
      req.params.ownerId,
      req.query as AvailabilityLookupQuery
    );
    return successResponse(res, "Availability schedule retrieved successfully", {
      availability
    });
  },

  async getBookableSlots(req: Request, res: Response): Promise<Response> {
    const slots = await availabilityService.getBookableSlots(
      req.params.ownerId,
      req.query as unknown as BookableSlotsQuery
    );
    return successResponse(res, "Bookable slots retrieved successfully", { slots });
  },

  async updateAvailability(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const availability = await availabilityService.updateAvailability(
      req.params.id,
      req.body as UpdateAvailabilityInput,
      actor
    );
    return successResponse(res, "Availability schedule updated successfully", {
      availability
    });
  },

  async deleteAvailability(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const availability = await availabilityService.deleteAvailability(req.params.id, actor);
    return successResponse(res, "Availability schedule deleted successfully", {
      availability
    });
  }
};

import { Request, Response } from "express";

import { UnauthorizedError } from "../../../shared/errors";
import {
  createdResponse,
  paginatedResponse,
  successResponse
} from "../../../shared/utils/apiResponse";
import { appointmentService } from "../service/appointment.service";
import {
  AppointmentListQuery,
  CreateAppointmentInput,
  RejectAppointmentInput,
  RescheduleAppointmentInput
} from "../types/appointment.types";

export const appointmentController = {
  async createAppointment(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const appointment = await appointmentService.createAppointment(
      req.body as CreateAppointmentInput,
      actor
    );
    return createdResponse(res, "Appointment requested successfully", { appointment });
  },

  async getAppointments(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const result = await appointmentService.getAppointments(
      actor,
      req.query as unknown as AppointmentListQuery
    );
    return paginatedResponse(res, "Appointments retrieved successfully", result.data, result.meta);
  },

  async getAppointmentById(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const appointment = await appointmentService.getAppointmentById(req.params.id, actor);
    return successResponse(res, "Appointment retrieved successfully", { appointment });
  },

  async approveAppointment(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const appointment = await appointmentService.approveAppointment(req.params.id, actor);
    return successResponse(res, "Appointment approved successfully", { appointment });
  },

  async rejectAppointment(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const appointment = await appointmentService.rejectAppointment(
      req.params.id,
      req.body as RejectAppointmentInput,
      actor
    );
    return successResponse(res, "Appointment rejected successfully", { appointment });
  },

  async cancelAppointment(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const appointment = await appointmentService.cancelAppointment(req.params.id, actor);
    return successResponse(res, "Appointment cancelled successfully", { appointment });
  },

  async rescheduleAppointment(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const appointment = await appointmentService.rescheduleAppointment(
      req.params.id,
      req.body as RescheduleAppointmentInput,
      actor
    );
    return successResponse(res, "Appointment rescheduled successfully", { appointment });
  },

  async completeAppointment(req: Request, res: Response): Promise<Response> {
    const actor = requireActor(req);
    const appointment = await appointmentService.completeAppointment(req.params.id, actor);
    return successResponse(res, "Appointment completed successfully", { appointment });
  }
};

export function requireActor(req: Request) {
  if (!req.user) throw new UnauthorizedError("Authentication required");
  return req.user;
}

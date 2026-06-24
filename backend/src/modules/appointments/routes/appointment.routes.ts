import { UserRole } from "@prisma/client";
import { Router } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { validateRequest } from "../../../shared/middleware/validateRequest";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { appointmentController } from "../controller/appointment.controller";
import {
  appointmentIdParamSchema,
  appointmentListQuerySchema,
  createAppointmentSchema,
  rejectAppointmentSchema,
  rescheduleAppointmentSchema
} from "../validators/appointment.validators";

const appointmentUsers = [
  UserRole.ADMIN,
  UserRole.STUDENT,
  UserRole.OFFICE_STAFF,
  UserRole.DEAN,
  UserRole.CHAIR,
  UserRole.PROFESSOR
];
const handlers = [
  UserRole.ADMIN,
  UserRole.OFFICE_STAFF,
  UserRole.DEAN,
  UserRole.CHAIR,
  UserRole.PROFESSOR
];

export const appointmentRoutes = Router();

appointmentRoutes.use(authenticate);

appointmentRoutes.get(
  "/",
  authorize(appointmentUsers),
  validateRequest({ query: appointmentListQuerySchema }),
  asyncHandler(appointmentController.getAppointments)
);
appointmentRoutes.post(
  "/",
  authorize([UserRole.STUDENT]),
  validateRequest({ body: createAppointmentSchema }),
  asyncHandler(appointmentController.createAppointment)
);
appointmentRoutes.patch(
  "/:id/approve",
  authorize(handlers),
  validateRequest({ params: appointmentIdParamSchema }),
  asyncHandler(appointmentController.approveAppointment)
);
appointmentRoutes.patch(
  "/:id/reject",
  authorize(handlers),
  validateRequest({
    params: appointmentIdParamSchema,
    body: rejectAppointmentSchema
  }),
  asyncHandler(appointmentController.rejectAppointment)
);
appointmentRoutes.patch(
  "/:id/cancel",
  authorize([UserRole.ADMIN, UserRole.STUDENT]),
  validateRequest({ params: appointmentIdParamSchema }),
  asyncHandler(appointmentController.cancelAppointment)
);
appointmentRoutes.post(
  "/:id/reschedule",
  authorize(appointmentUsers),
  validateRequest({
    params: appointmentIdParamSchema,
    body: rescheduleAppointmentSchema
  }),
  asyncHandler(appointmentController.rescheduleAppointment)
);
appointmentRoutes.patch(
  "/:id/complete",
  authorize(handlers),
  validateRequest({ params: appointmentIdParamSchema }),
  asyncHandler(appointmentController.completeAppointment)
);
appointmentRoutes.get(
  "/:id",
  authorize(appointmentUsers),
  validateRequest({ params: appointmentIdParamSchema }),
  asyncHandler(appointmentController.getAppointmentById)
);

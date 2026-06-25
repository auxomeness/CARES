import { UserRole } from "@prisma/client";
import { Router } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { validateRequest } from "../../../shared/middleware/validateRequest";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { availabilityController } from "../availability/availability.controller";
import {
  availabilityIdParamSchema,
  availabilityLookupQuerySchema,
  availabilityOwnerParamSchema,
  bookableSlotsQuerySchema,
  createAvailabilitySchema,
  updateAvailabilitySchema
} from "../validators/appointment.validators";

const scheduleManagers = [
  UserRole.ADMIN,
  UserRole.OFFICE_STAFF,
  UserRole.DEAN,
  UserRole.CHAIR,
  UserRole.PROFESSOR
];

export const availabilityRoutes = Router();

availabilityRoutes.use(authenticate);

availabilityRoutes.post(
  "/",
  authorize(scheduleManagers),
  validateRequest({ body: createAvailabilitySchema }),
  asyncHandler(availabilityController.createAvailability)
);
availabilityRoutes.get(
  "/:ownerId/slots",
  validateRequest({
    params: availabilityOwnerParamSchema,
    query: bookableSlotsQuerySchema
  }),
  asyncHandler(availabilityController.getBookableSlots)
);
availabilityRoutes.get(
  "/:ownerId",
  validateRequest({
    params: availabilityOwnerParamSchema,
    query: availabilityLookupQuerySchema
  }),
  asyncHandler(availabilityController.getAvailability)
);
availabilityRoutes.patch(
  "/:id",
  authorize(scheduleManagers),
  validateRequest({
    params: availabilityIdParamSchema,
    body: updateAvailabilitySchema
  }),
  asyncHandler(availabilityController.updateAvailability)
);
availabilityRoutes.delete(
  "/:id",
  authorize(scheduleManagers),
  validateRequest({ params: availabilityIdParamSchema }),
  asyncHandler(availabilityController.deleteAvailability)
);

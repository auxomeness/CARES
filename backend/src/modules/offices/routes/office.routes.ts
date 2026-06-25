import { UserRole } from "@prisma/client";
import { Router } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { validateRequest } from "../../../shared/middleware/validateRequest";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { paginationQuerySchema } from "../../../shared/validators/pagination.validators";
import { officeController } from "../controller/office.controller";
import {
  createOfficeSchema,
  officeIdParamSchema,
  updateOfficeSchema
} from "../validators/office.validators";

export const officeRoutes = Router();

officeRoutes.use(authenticate);

officeRoutes.get(
  "/",
  validateRequest({ query: paginationQuerySchema }),
  asyncHandler(officeController.getAllOffices)
);
officeRoutes.get(
  "/:id",
  validateRequest({ params: officeIdParamSchema }),
  asyncHandler(officeController.getOfficeById)
);
officeRoutes.post(
  "/",
  authorize([UserRole.ADMIN]),
  validateRequest({ body: createOfficeSchema }),
  asyncHandler(officeController.createOffice)
);
officeRoutes.put(
  "/:id",
  authorize([UserRole.ADMIN]),
  validateRequest({ params: officeIdParamSchema, body: updateOfficeSchema }),
  asyncHandler(officeController.updateOffice)
);
officeRoutes.delete(
  "/:id",
  authorize([UserRole.ADMIN]),
  validateRequest({ params: officeIdParamSchema }),
  asyncHandler(officeController.deleteOffice)
);

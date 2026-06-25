import { UserRole } from "@prisma/client";
import { Router } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { validateRequest } from "../../../shared/middleware/validateRequest";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { paginationQuerySchema } from "../../../shared/validators/pagination.validators";
import { facultyController } from "../controller/faculty.controller";
import {
  createFacultySchema,
  facultyIdParamSchema,
  updateFacultySchema
} from "../validators/faculty.validators";

export const facultyRoutes = Router();

facultyRoutes.use(authenticate);

facultyRoutes.get(
  "/",
  validateRequest({ query: paginationQuerySchema }),
  asyncHandler(facultyController.getAllFaculty)
);
facultyRoutes.get(
  "/:id",
  validateRequest({ params: facultyIdParamSchema }),
  asyncHandler(facultyController.getFacultyById)
);
facultyRoutes.post(
  "/",
  authorize([UserRole.ADMIN]),
  validateRequest({ body: createFacultySchema }),
  asyncHandler(facultyController.createFaculty)
);
facultyRoutes.put(
  "/:id",
  authorize([UserRole.ADMIN]),
  validateRequest({ params: facultyIdParamSchema, body: updateFacultySchema }),
  asyncHandler(facultyController.updateFaculty)
);
facultyRoutes.delete(
  "/:id",
  authorize([UserRole.ADMIN]),
  validateRequest({ params: facultyIdParamSchema }),
  asyncHandler(facultyController.deleteFaculty)
);

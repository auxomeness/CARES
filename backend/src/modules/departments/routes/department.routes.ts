import { UserRole } from "@prisma/client";
import { Router } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { validateRequest } from "../../../shared/middleware/validateRequest";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { paginationQuerySchema } from "../../../shared/validators/pagination.validators";
import { departmentController } from "../controller/department.controller";
import {
  createDepartmentSchema,
  departmentIdParamSchema,
  updateDepartmentSchema
} from "../validators/department.validators";

export const departmentRoutes = Router();

departmentRoutes.use(authenticate);

departmentRoutes.get(
  "/",
  validateRequest({ query: paginationQuerySchema }),
  asyncHandler(departmentController.getAllDepartments)
);
departmentRoutes.get(
  "/:id",
  validateRequest({ params: departmentIdParamSchema }),
  asyncHandler(departmentController.getDepartmentById)
);
departmentRoutes.post(
  "/",
  authorize([UserRole.ADMIN]),
  validateRequest({ body: createDepartmentSchema }),
  asyncHandler(departmentController.createDepartment)
);
departmentRoutes.put(
  "/:id",
  authorize([UserRole.ADMIN]),
  validateRequest({ params: departmentIdParamSchema, body: updateDepartmentSchema }),
  asyncHandler(departmentController.updateDepartment)
);
departmentRoutes.delete(
  "/:id",
  authorize([UserRole.ADMIN]),
  validateRequest({ params: departmentIdParamSchema }),
  asyncHandler(departmentController.deleteDepartment)
);

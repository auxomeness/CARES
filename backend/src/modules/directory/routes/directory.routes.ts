import { Router } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { validateRequest } from "../../../shared/middleware/validateRequest";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { directoryController } from "../controller/directory.controller";
import { directorySearchQuerySchema } from "../validators/directory.validators";

export const directoryRoutes = Router();

directoryRoutes.use(authenticate);

directoryRoutes.get(
  "/faculty",
  validateRequest({ query: directorySearchQuerySchema }),
  asyncHandler(directoryController.getFacultyDirectory)
);
directoryRoutes.get(
  "/offices",
  validateRequest({ query: directorySearchQuerySchema }),
  asyncHandler(directoryController.getOfficeDirectory)
);
directoryRoutes.get(
  "/departments",
  validateRequest({ query: directorySearchQuerySchema }),
  asyncHandler(directoryController.getDepartmentDirectory)
);

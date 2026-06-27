import { Router } from "express";

import { authenticate } from "../../shared/middleware/authenticate";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { bootstrapController } from "./bootstrap.controller";

export const bootstrapRoutes = Router();

bootstrapRoutes.get("/", authenticate, asyncHandler(bootstrapController.getBootstrap));

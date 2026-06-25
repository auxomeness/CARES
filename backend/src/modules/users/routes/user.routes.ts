import { Router } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { userController } from "../controller/user.controller";

export const userRoutes = Router();

userRoutes.get("/me", authenticate, asyncHandler(userController.me));

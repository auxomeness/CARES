import { Router } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { validateRequest } from "../../../shared/middleware/validateRequest";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { userController } from "../controller/user.controller";
import { updateCurrentUserSchema } from "../validators/user.validators";

export const userRoutes = Router();

userRoutes.get("/me", authenticate, asyncHandler(userController.me));
userRoutes.put(
  "/me",
  authenticate,
  validateRequest({ body: updateCurrentUserSchema }),
  asyncHandler(userController.updateMe)
);

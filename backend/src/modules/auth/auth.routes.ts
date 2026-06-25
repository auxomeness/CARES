import { Router } from "express";
import rateLimit from "express-rate-limit";

import { authenticate } from "../../shared/middleware/authenticate";
import { validateRequest } from "../../shared/middleware/validateRequest";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { errorResponse } from "../../shared/utils/apiResponse";
import { authController } from "./auth.controller";
import { loginSchema, registerStudentSchema } from "./auth.validators";

export const authRoutes = Router();

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req, res) =>
    errorResponse(res, 429, "Too many login attempts. Please try again later.")
});

authRoutes.post(
  "/login",
  loginRateLimiter,
  validateRequest({ body: loginSchema }),
  asyncHandler(authController.login)
);
authRoutes.post(
  "/register",
  loginRateLimiter,
  validateRequest({ body: registerStudentSchema }),
  asyncHandler(authController.register)
);
authRoutes.get("/departments", asyncHandler(authController.departments));

authRoutes.get("/me", authenticate, asyncHandler(authController.me));

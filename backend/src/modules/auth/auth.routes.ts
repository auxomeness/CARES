import { Router } from "express";
import rateLimit from "express-rate-limit";

import { authenticate } from "../../shared/middleware/authenticate";
import { validateRequest } from "../../shared/middleware/validateRequest";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { authController } from "./auth.controller";
import { loginSchema } from "./auth.validators";

export const authRoutes = Router();

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false
});

authRoutes.post(
  "/login",
  loginRateLimiter,
  validateRequest({ body: loginSchema }),
  asyncHandler(authController.login)
);

authRoutes.get("/me", authenticate, asyncHandler(authController.me));

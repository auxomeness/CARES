import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { authRoutes } from "./modules/auth/auth.routes";
import { globalErrorHandler } from "./shared/middleware/globalErrorHandler";
import { notFoundHandler } from "./shared/middleware/notFoundHandler";
import { requestLogger } from "./shared/middleware/requestLogger";
import { successResponse } from "./shared/utils/apiResponse";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);
app.use(requestLogger);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  return successResponse(res, "CARES API is healthy", { status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/api/v1/auth", authRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

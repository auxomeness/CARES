import cors from "cors";
import compression from "compression";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { corsOrigins } from "./config/env";
import { authRoutes } from "./modules/auth/auth.routes";
import { appointmentRoutes } from "./modules/appointments/routes/appointment.routes";
import { availabilityRoutes } from "./modules/appointments/routes/availability.routes";
import { bootstrapRoutes } from "./modules/bootstrap";
import { concernRoutes } from "./modules/concerns/routes/concern.routes";
import { departmentRoutes } from "./modules/departments/routes/department.routes";
import { directoryRoutes } from "./modules/directory/routes/directory.routes";
import { facultyRoutes } from "./modules/faculty/routes/faculty.routes";
import { officeRoutes } from "./modules/offices/routes/office.routes";
import { notificationRoutes } from "./modules/notifications/routes/notification.routes";
import { studentRoutes } from "./modules/students/routes/student.routes";
import { userRoutes } from "./modules/users/routes/user.routes";
import { globalErrorHandler } from "./shared/middleware/globalErrorHandler";
import { metricsAuth } from "./shared/middleware/metricsAuth";
import { metricsMiddleware, metricsRegistry } from "./shared/middleware/metrics";
import { notFoundHandler } from "./shared/middleware/notFoundHandler";
import { requestLogger } from "./shared/middleware/requestLogger";
import { requestTimeout } from "./shared/middleware/requestTimeout";
import { successResponse } from "./shared/utils/apiResponse";
import { errorResponse } from "./shared/utils/apiResponse";

export const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req, res) => errorResponse(res, 429, "Too many requests. Please try again later.")
  })
);
app.use(requestLogger);
app.use(metricsMiddleware);
app.use(requestTimeout);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  return successResponse(res, "CARES API is healthy", { status: "ok" });
});
app.get("/metrics", metricsAuth, async (_req, res) => {
  res.setHeader("Content-Type", metricsRegistry.contentType);
  res.send(await metricsRegistry.metrics());
});

app.use("/auth", authRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/bootstrap", bootstrapRoutes);
app.use("/api/v1/bootstrap", bootstrapRoutes);
app.use("/users", userRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/offices", officeRoutes);
app.use("/api/v1/offices", officeRoutes);
app.use("/departments", departmentRoutes);
app.use("/api/v1/departments", departmentRoutes);
app.use("/faculty", facultyRoutes);
app.use("/api/v1/faculty", facultyRoutes);
app.use("/students", studentRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/directory", directoryRoutes);
app.use("/api/v1/directory", directoryRoutes);
app.use("/concerns", concernRoutes);
app.use("/api/v1/concerns", concernRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/availability", availabilityRoutes);
app.use("/api/v1/availability", availabilityRoutes);
app.use("/notifications", notificationRoutes);
app.use("/api/v1/notifications", notificationRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

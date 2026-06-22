import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { authRoutes } from "./modules/auth/auth.routes";
import { departmentRoutes } from "./modules/departments/routes/department.routes";
import { directoryRoutes } from "./modules/directory/routes/directory.routes";
import { facultyRoutes } from "./modules/faculty/routes/faculty.routes";
import { officeRoutes } from "./modules/offices/routes/office.routes";
import { studentRoutes } from "./modules/students/routes/student.routes";
import { userRoutes } from "./modules/users/routes/user.routes";
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

app.use(notFoundHandler);
app.use(globalErrorHandler);

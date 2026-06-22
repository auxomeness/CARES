import { UserRole } from "@prisma/client";
import { Router } from "express";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { validateRequest } from "../../../shared/middleware/validateRequest";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { paginationQuerySchema } from "../../../shared/validators/pagination.validators";
import { studentController } from "../controller/student.controller";
import {
  createStudentSchema,
  studentIdParamSchema,
  updateStudentSchema
} from "../validators/student.validators";

export const studentRoutes = Router();

studentRoutes.use(authenticate);

studentRoutes.get(
  "/",
  authorize([UserRole.ADMIN, UserRole.OFFICE_STAFF, UserRole.DEAN, UserRole.CHAIR]),
  validateRequest({ query: paginationQuerySchema }),
  asyncHandler(studentController.getAllStudents)
);
studentRoutes.get(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.OFFICE_STAFF, UserRole.DEAN, UserRole.CHAIR]),
  validateRequest({ params: studentIdParamSchema }),
  asyncHandler(studentController.getStudentById)
);
studentRoutes.post(
  "/",
  authorize([UserRole.ADMIN]),
  validateRequest({ body: createStudentSchema }),
  asyncHandler(studentController.createStudent)
);
studentRoutes.put(
  "/:id",
  authorize([UserRole.ADMIN]),
  validateRequest({ params: studentIdParamSchema, body: updateStudentSchema }),
  asyncHandler(studentController.updateStudent)
);
studentRoutes.delete(
  "/:id",
  authorize([UserRole.ADMIN]),
  validateRequest({ params: studentIdParamSchema }),
  asyncHandler(studentController.deleteStudent)
);

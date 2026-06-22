import { FacultyPosition } from "@prisma/client";
import { z } from "zod";

export const facultyIdParamSchema = z.object({
  id: z.string().cuid("Invalid faculty id")
});

export const createFacultySchema = z.object({
  email: z.string().trim().email("A valid email is required").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().trim().min(1, "First name is required"),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, "Last name is required"),
  employeeId: z.string().trim().min(1, "Employee id is required"),
  departmentId: z.string().cuid("Invalid department id"),
  position: z.nativeEnum(FacultyPosition)
});

export const updateFacultySchema = createFacultySchema
  .omit({ password: true })
  .partial()
  .extend({
    password: z.string().min(6, "Password must be at least 6 characters").optional()
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

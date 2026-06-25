import { z } from "zod";

export const studentIdParamSchema = z.object({
  id: z.string().cuid("Invalid student profile id")
});

export const createStudentSchema = z.object({
  email: z.string().trim().email("A valid email is required").toLowerCase(),
  password: z.string().min(12, "Password must be at least 12 characters").max(72),
  firstName: z.string().trim().min(1, "First name is required").max(100),
  middleName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  studentId: z.string().trim().min(1, "Student id is required").max(50),
  course: z.string().trim().min(1, "Course is required").max(200),
  yearLevel: z.coerce.number().int().min(1, "Year level must be at least 1"),
  departmentId: z.string().cuid("Invalid department id")
});

export const updateStudentSchema = createStudentSchema
  .omit({ password: true })
  .partial()
  .extend({
    password: z.string().min(12, "Password must be at least 12 characters").max(72).optional()
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

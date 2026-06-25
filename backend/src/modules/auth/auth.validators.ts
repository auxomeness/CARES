import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("A valid email is required").toLowerCase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must not exceed 72 characters")
});

export const registerStudentSchema = z.object({
  email: z.string().trim().email("A valid email is required").toLowerCase(),
  password: z.string().min(12, "Password must be at least 12 characters").max(72),
  firstName: z.string().trim().min(1, "First name is required").max(100),
  middleName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  studentId: z.string().trim().min(1, "Student id is required").max(50),
  course: z.string().trim().min(1, "Course is required").max(200),
  yearLevel: z.coerce.number().int().min(1).max(10),
  departmentId: z.string().cuid("Invalid department id")
});

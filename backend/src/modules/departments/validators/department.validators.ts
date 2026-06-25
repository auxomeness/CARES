import { z } from "zod";

export const departmentIdParamSchema = z.object({
  id: z.string().cuid("Invalid department id")
});

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(1, "Department name is required").max(200),
  description: z.string().trim().max(2_000).optional(),
  email: z.string().trim().email("A valid department email is required").toLowerCase(),
  location: z.string().trim().max(300).optional()
});

export const updateDepartmentSchema = createDepartmentSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

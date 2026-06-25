import { z } from "zod";

export const updateCurrentUserSchema = z
  .object({
    email: z.string().trim().email().toLowerCase().optional(),
    firstName: z.string().trim().min(1).max(100).optional(),
    middleName: z.string().trim().max(100).nullable().optional(),
    lastName: z.string().trim().min(1).max(100).optional(),
    course: z.string().trim().min(1).max(200).optional(),
    yearLevel: z.coerce.number().int().min(1).max(10).optional()
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

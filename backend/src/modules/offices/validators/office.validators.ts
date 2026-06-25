import { z } from "zod";

export const officeIdParamSchema = z.object({
  id: z.string().cuid("Invalid office id")
});

export const createOfficeSchema = z.object({
  name: z.string().trim().min(1, "Office name is required").max(200),
  description: z.string().trim().max(2_000).optional(),
  email: z.string().trim().email("A valid office email is required").toLowerCase(),
  location: z.string().trim().max(300).optional()
});

export const updateOfficeSchema = createOfficeSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

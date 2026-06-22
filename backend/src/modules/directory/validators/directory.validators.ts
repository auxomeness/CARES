import { z } from "zod";

export const directorySearchQuerySchema = z.object({
  search: z.string().trim().min(1).optional()
});

import { z } from "zod";

import { paginationQuerySchema } from "../../../shared/validators/pagination.validators";

export const notificationIdParamSchema = z.object({
  id: z.string().cuid("Invalid notification id")
});

export const notificationListQuerySchema = paginationQuerySchema
  .omit({ search: true })
  .extend({
    isRead: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
    startDate: z.string().datetime({ offset: true }).optional(),
    endDate: z.string().datetime({ offset: true }).optional()
  })
  .refine(
    (value) =>
      !value.startDate || !value.endDate || new Date(value.endDate) >= new Date(value.startDate),
    {
      message: "End date must be on or after start date",
      path: ["endDate"]
    }
  );

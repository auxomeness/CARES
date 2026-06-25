import { z } from "zod";

import { createOfficeSchema, updateOfficeSchema } from "../validators/office.validators";

export type CreateOfficeInput = z.infer<typeof createOfficeSchema>;
export type UpdateOfficeInput = z.infer<typeof updateOfficeSchema>;

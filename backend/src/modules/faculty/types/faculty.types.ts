import { z } from "zod";

import { createFacultySchema, updateFacultySchema } from "../validators/faculty.validators";

export type CreateFacultyInput = z.infer<typeof createFacultySchema>;
export type UpdateFacultyInput = z.infer<typeof updateFacultySchema>;

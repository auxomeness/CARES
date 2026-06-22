import { z } from "zod";

import {
  createDepartmentSchema,
  updateDepartmentSchema
} from "../validators/department.validators";

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;

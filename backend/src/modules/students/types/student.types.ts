import { z } from "zod";

import { createStudentSchema, updateStudentSchema } from "../validators/student.validators";

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

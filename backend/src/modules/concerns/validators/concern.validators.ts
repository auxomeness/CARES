import { ConcernStatus, ConcernTargetType, ConcernVisibility } from "@prisma/client";
import { z } from "zod";

import { paginationQuerySchema } from "../../../shared/validators/pagination.validators";

const nullableCuid = z.string().cuid().nullable().optional();

function hasValidTarget(value: {
  targetType: ConcernTargetType;
  targetOfficeId?: string | null;
  targetDepartmentId?: string | null;
}): boolean {
  if (value.targetType === ConcernTargetType.OFFICE) {
    return Boolean(value.targetOfficeId) && !value.targetDepartmentId;
  }

  return Boolean(value.targetDepartmentId) && !value.targetOfficeId;
}

export const concernIdParamSchema = z.object({
  id: z.string().cuid("Invalid concern id")
});

export const createConcernSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    description: z.string().trim().min(1, "Description is required").max(10_000),
    targetType: z.nativeEnum(ConcernTargetType),
    targetOfficeId: nullableCuid,
    targetDepartmentId: nullableCuid,
    visibility: z.nativeEnum(ConcernVisibility).default(ConcernVisibility.PRIVATE)
  })
  .refine(hasValidTarget, {
    message: "Select exactly one target matching targetType",
    path: ["targetType"]
  });

export const concernListQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(ConcernStatus).optional(),
  targetType: z.nativeEnum(ConcernTargetType).optional(),
  targetOfficeId: z.string().cuid().optional(),
  targetDepartmentId: z.string().cuid().optional()
});

export const updateConcernStatusSchema = z.object({
  status: z.enum([ConcernStatus.UNDER_REVIEW, ConcernStatus.IN_PROGRESS, ConcernStatus.CLOSED])
});

export const transferConcernSchema = z
  .object({
    toTargetType: z.nativeEnum(ConcernTargetType),
    toOfficeId: nullableCuid,
    toDepartmentId: nullableCuid,
    reason: z.string().trim().min(1, "Transfer reason is required").max(2_000)
  })
  .refine(
    (value) =>
      hasValidTarget({
        targetType: value.toTargetType,
        targetOfficeId: value.toOfficeId,
        targetDepartmentId: value.toDepartmentId
      }),
    {
      message: "Select exactly one transfer target matching toTargetType",
      path: ["toTargetType"]
    }
  );

export const createResolutionSchema = z.object({
  summary: z.string().trim().min(1, "Resolution summary is required").max(2_000),
  actionsTaken: z.string().trim().min(1, "Actions taken are required").max(10_000),
  evidenceUrl: z.string().trim().url("Evidence URL must be valid").optional()
});

export const rejectResolutionSchema = z.object({
  reason: z.string().trim().min(1, "Rejection reason is required").max(2_000)
});

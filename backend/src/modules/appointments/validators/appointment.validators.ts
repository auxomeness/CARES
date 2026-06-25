import { AppointmentStatus, AppointmentTargetType } from "@prisma/client";
import { z } from "zod";

import { paginationQuerySchema } from "../../../shared/validators/pagination.validators";

const nullableCuid = z.string().cuid().nullable().optional();
const isoDateTime = z.string().datetime({ offset: true });
const timeValue = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must use HH:mm format");

function hasValidTarget(value: {
  targetType: AppointmentTargetType;
  officeId?: string | null;
  departmentId?: string | null;
  facultyId?: string | null;
}): boolean {
  const selected = [value.officeId, value.departmentId, value.facultyId].filter(Boolean);
  if (selected.length !== 1) return false;

  if (value.targetType === AppointmentTargetType.OFFICE) return Boolean(value.officeId);
  if (value.targetType === AppointmentTargetType.DEPARTMENT) return Boolean(value.departmentId);
  return Boolean(value.facultyId);
}

export const appointmentIdParamSchema = z.object({
  id: z.string().cuid("Invalid appointment id")
});

export const availabilityOwnerParamSchema = z.object({
  ownerId: z.string().cuid("Invalid availability owner id")
});

export const availabilityIdParamSchema = z.object({
  id: z.string().cuid("Invalid availability schedule id")
});

export const createAppointmentSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    description: z.string().trim().max(5_000).optional(),
    targetType: z.nativeEnum(AppointmentTargetType),
    officeId: nullableCuid,
    departmentId: nullableCuid,
    facultyId: nullableCuid,
    startTime: isoDateTime,
    endTime: isoDateTime
  })
  .refine(hasValidTarget, {
    message: "Select exactly one target matching targetType",
    path: ["targetType"]
  })
  .refine((value) => new Date(value.endTime) > new Date(value.startTime), {
    message: "End time must be after start time",
    path: ["endTime"]
  });

export const appointmentListQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(AppointmentStatus).optional(),
  studentId: z.string().cuid().optional(),
  officeId: z.string().cuid().optional(),
  departmentId: z.string().cuid().optional(),
  facultyId: z.string().cuid().optional(),
  startFrom: isoDateTime.optional(),
  startTo: isoDateTime.optional()
});

export const rejectAppointmentSchema = z.object({
  reason: z.string().trim().min(1, "Rejection reason is required").max(2_000)
});

export const rescheduleAppointmentSchema = z
  .object({
    newStartTime: isoDateTime,
    newEndTime: isoDateTime,
    reason: z.string().trim().min(1, "Reschedule reason is required").max(2_000)
  })
  .refine((value) => new Date(value.newEndTime) > new Date(value.newStartTime), {
    message: "New end time must be after new start time",
    path: ["newEndTime"]
  });

export const createAvailabilitySchema = z
  .object({
    targetType: z.nativeEnum(AppointmentTargetType).optional(),
    officeId: nullableCuid,
    departmentId: nullableCuid,
    facultyId: nullableCuid,
    dayOfWeek: z.coerce.number().int().min(1).max(7),
    startTime: timeValue,
    endTime: timeValue,
    slotDuration: z.coerce.number().int().min(5).max(480),
    isActive: z.boolean().default(true)
  })
  .refine((value) => value.endTime > value.startTime, {
    message: "Availability end time must be after start time",
    path: ["endTime"]
  })
  .refine(
    (value) =>
      value.targetType === undefined ||
      hasValidTarget({
        targetType: value.targetType,
        officeId: value.officeId,
        departmentId: value.departmentId,
        facultyId: value.facultyId
      }),
    {
      message: "Select exactly one availability target matching targetType",
      path: ["targetType"]
    }
  );

export const updateAvailabilitySchema = z
  .object({
    dayOfWeek: z.coerce.number().int().min(1).max(7).optional(),
    startTime: timeValue.optional(),
    endTime: timeValue.optional(),
    slotDuration: z.coerce.number().int().min(5).max(480).optional(),
    isActive: z.boolean().optional()
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const availabilityLookupQuerySchema = z.object({
  targetType: z.nativeEnum(AppointmentTargetType).optional()
});

export const bookableSlotsQuerySchema = z.object({
  targetType: z.nativeEnum(AppointmentTargetType),
  date: z.string().date("Date must use YYYY-MM-DD format")
});

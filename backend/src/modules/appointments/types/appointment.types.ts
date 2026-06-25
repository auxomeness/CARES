import { AppointmentStatus, AppointmentTargetType, Prisma } from "@prisma/client";

export type AppointmentTarget = {
  targetType: AppointmentTargetType;
  officeId?: string | null;
  departmentId?: string | null;
  facultyId?: string | null;
};

export type CreateAppointmentInput = AppointmentTarget & {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
};

export type AppointmentListQuery = {
  page: number;
  limit: number;
  search?: string;
  status?: AppointmentStatus;
  studentId?: string;
  officeId?: string;
  departmentId?: string;
  facultyId?: string;
  startFrom?: string;
  startTo?: string;
};

export type RejectAppointmentInput = {
  reason: string;
};

export type RescheduleAppointmentInput = {
  newStartTime: string;
  newEndTime: string;
  reason: string;
};

export type CreateAvailabilityInput = AppointmentTarget & {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
};

export type UpdateAvailabilityInput = Partial<
  Pick<CreateAvailabilityInput, "dayOfWeek" | "startTime" | "endTime" | "slotDuration" | "isActive">
>;

export type AvailabilityLookupQuery = {
  targetType?: AppointmentTargetType;
};

export type BookableSlotsQuery = {
  targetType: AppointmentTargetType;
  date: string;
};

export type PrismaTransaction = Prisma.TransactionClient;

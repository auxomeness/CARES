import { AppointmentTargetType, ConcernTargetType } from "@prisma/client";

export enum NotificationEventType {
  CONCERN_SUBMITTED = "CONCERN_SUBMITTED",
  CONCERN_TRANSFERRED = "CONCERN_TRANSFERRED",
  CONCERN_RESOLVED = "CONCERN_RESOLVED",
  CONCERN_REOPENED = "CONCERN_REOPENED",
  CONCERN_SUPPORT_ADDED = "CONCERN_SUPPORT_ADDED",
  APPOINTMENT_CREATED = "APPOINTMENT_CREATED",
  APPOINTMENT_APPROVED = "APPOINTMENT_APPROVED",
  APPOINTMENT_REJECTED = "APPOINTMENT_REJECTED",
  APPOINTMENT_RESCHEDULED = "APPOINTMENT_RESCHEDULED",
  APPOINTMENT_CANCELLED = "APPOINTMENT_CANCELLED",
  APPOINTMENT_COMPLETED = "APPOINTMENT_COMPLETED"
}

export type CreateNotificationInput = {
  userId: string;
  eventKey?: string;
  title: string;
  message: string;
};

export type NotificationListQuery = {
  page: number;
  limit: number;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
};

export type NotificationTarget = {
  targetType: AppointmentTargetType | ConcernTargetType;
  officeId?: string | null;
  departmentId?: string | null;
  facultyId?: string | null;
};

export type NotificationDomainEvent = NotificationTarget & {
  eventId?: string;
  type: NotificationEventType;
  resourceId: string;
  resourceTitle: string;
  referenceNumber?: string;
  studentUserId?: string;
  actorUserId?: string;
  reason?: string;
  startTime?: Date | string;
  endTime?: Date | string;
};

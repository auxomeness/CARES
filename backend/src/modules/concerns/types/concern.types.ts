import { ConcernStatus, ConcernTargetType, ConcernVisibility, Prisma } from "@prisma/client";

export const CONCERN_TIMELINE_EVENTS = {
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  IN_PROGRESS: "IN_PROGRESS",
  TRANSFERRED: "TRANSFERRED",
  RESOLUTION_SUBMITTED: "RESOLUTION_SUBMITTED",
  AWAITING_CONFIRMATION: "AWAITING_CONFIRMATION",
  REOPENED: "REOPENED",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
  ATTACHMENT_ADDED: "ATTACHMENT_ADDED",
  SUPPORTED: "SUPPORTED"
} as const;

export type ConcernTimelineEvent =
  (typeof CONCERN_TIMELINE_EVENTS)[keyof typeof CONCERN_TIMELINE_EVENTS];

export type CreateConcernInput = {
  title: string;
  description: string;
  targetType: ConcernTargetType;
  targetOfficeId?: string | null;
  targetDepartmentId?: string | null;
  visibility: ConcernVisibility;
};

export type ConcernListQuery = {
  page: number;
  limit: number;
  search?: string;
  status?: ConcernStatus;
  targetType?: ConcernTargetType;
  targetOfficeId?: string;
  targetDepartmentId?: string;
};

export type UpdateConcernStatusInput = {
  status: "UNDER_REVIEW" | "IN_PROGRESS" | "CLOSED";
};

export type TransferConcernInput = {
  toTargetType: ConcernTargetType;
  toOfficeId?: string | null;
  toDepartmentId?: string | null;
  reason: string;
};

export type CreateResolutionInput = {
  summary: string;
  actionsTaken: string;
  evidenceUrl?: string;
};

export type RejectResolutionInput = {
  reason: string;
};

export type CreateAttachmentInput = {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
};

export type PrismaTransaction = Prisma.TransactionClient;

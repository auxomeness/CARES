import { ConcernStatus, ConcernTargetType, Prisma, UserRole } from "@prisma/client";

import { prisma } from "../../../config/database";
import {
  ConcernListQuery,
  CreateAttachmentInput,
  CreateConcernInput,
  CreateResolutionInput,
  PrismaTransaction,
  TransferConcernInput
} from "../types/concern.types";

const userSummarySelect = {
  id: true,
  email: true,
  firstName: true,
  middleName: true,
  lastName: true,
  role: true
} as const;

const concernSummaryInclude = {
  submittedBy: {
    include: {
      user: { select: userSummarySelect },
      department: { select: { id: true, name: true } }
    }
  },
  targetOffice: true,
  targetDepartment: true,
  _count: {
    select: {
      supports: true,
      attachments: true
    }
  }
} as const;

const concernDetailInclude = {
  ...concernSummaryInclude,
  attachments: {
    orderBy: { uploadedAt: "asc" as const }
  },
  timeline: {
    include: {
      actor: { select: userSummarySelect }
    },
    orderBy: { createdAt: "asc" as const }
  },
  transfers: {
    include: {
      transferredBy: { select: userSummarySelect },
      fromOffice: true,
      fromDepartment: true,
      toOffice: true,
      toDepartment: true
    },
    orderBy: { createdAt: "asc" as const }
  },
  resolutionReport: {
    include: {
      resolvedBy: { select: userSummarySelect }
    }
  },
  reopenRequests: {
    include: {
      student: {
        include: {
          user: { select: userSummarySelect }
        }
      }
    },
    orderBy: { createdAt: "asc" as const }
  }
} as const;

export const concernRepository = {
  findStudentByUserId(userId: string) {
    return prisma.studentProfile.findUnique({
      where: { userId },
      select: { id: true, userId: true, departmentId: true }
    });
  },

  findFacultyByUserId(userId: string) {
    return prisma.facultyProfile.findUnique({
      where: { userId },
      select: { id: true, userId: true, departmentId: true, position: true }
    });
  },

  findOfficeStaffByUserId(userId: string) {
    return prisma.officeStaffProfile.findUnique({
      where: { userId },
      select: { id: true, userId: true, officeId: true }
    });
  },

  findOfficeById(id: string) {
    return prisma.office.findUnique({ where: { id }, select: { id: true, name: true } });
  },

  findDepartmentById(id: string) {
    return prisma.department.findUnique({ where: { id }, select: { id: true, name: true } });
  },

  async createConcern(
    input: CreateConcernInput,
    submittedById: string,
    actorId: string,
    referenceNumber: string
  ) {
    return prisma.$transaction(async (tx) => {
      const concern = await tx.concern.create({
        data: {
          referenceNumber,
          title: input.title,
          description: input.description,
          targetType: input.targetType,
          targetOfficeId: input.targetOfficeId,
          targetDepartmentId: input.targetDepartmentId,
          visibility: input.visibility,
          submittedById
        }
      });

      await createTimeline(tx, concern.id, actorId, "SUBMITTED", "Concern submitted");

      return tx.concern.findUniqueOrThrow({
        where: { id: concern.id },
        include: concernDetailInclude
      });
    });
  },

  findAll(where: Prisma.ConcernWhereInput, query: ConcernListQuery, skip: number, take: number) {
    return prisma.concern.findMany({
      where,
      skip,
      take,
      include: concernSummaryInclude,
      orderBy: { createdAt: "desc" }
    });
  },

  count(where: Prisma.ConcernWhereInput) {
    return prisma.concern.count({ where });
  },

  findById(id: string) {
    return prisma.concern.findUnique({
      where: { id },
      include: concernDetailInclude
    });
  },

  findAccessRecord(id: string) {
    return prisma.concern.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        visibility: true,
        targetType: true,
        targetOfficeId: true,
        targetDepartmentId: true,
        submittedBy: {
          select: {
            id: true,
            userId: true
          }
        },
        resolutionReport: {
          select: { id: true }
        }
      }
    });
  },

  async updateStatus(id: string, status: ConcernStatus, actorId: string, description: string) {
    return prisma.$transaction(async (tx) => {
      await tx.concern.update({
        where: { id },
        data: {
          status,
          resolvedAt: status === ConcernStatus.RESOLVED ? new Date() : undefined
        }
      });
      await createTimeline(tx, id, actorId, status, description);

      return tx.concern.findUniqueOrThrow({
        where: { id },
        include: concernDetailInclude
      });
    });
  },

  async transfer(
    id: string,
    actorId: string,
    input: TransferConcernInput,
    current: {
      targetType: ConcernTargetType;
      targetOfficeId: string | null;
      targetDepartmentId: string | null;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.concernTransfer.create({
        data: {
          concernId: id,
          transferredById: actorId,
          fromTargetType: current.targetType,
          fromOfficeId: current.targetOfficeId,
          fromDepartmentId: current.targetDepartmentId,
          toTargetType: input.toTargetType,
          toOfficeId: input.toOfficeId,
          toDepartmentId: input.toDepartmentId,
          reason: input.reason
        }
      });

      await tx.concern.update({
        where: { id },
        data: {
          targetType: input.toTargetType,
          targetOfficeId: input.toOfficeId,
          targetDepartmentId: input.toDepartmentId,
          status: ConcernStatus.TRANSFERRED,
          resolvedAt: null
        }
      });

      await createTimeline(tx, id, actorId, "TRANSFERRED", `Concern transferred: ${input.reason}`);

      return tx.concern.findUniqueOrThrow({
        where: { id },
        include: concernDetailInclude
      });
    });
  },

  async createResolution(id: string, actorId: string, input: CreateResolutionInput) {
    return prisma.$transaction(async (tx) => {
      const resolvedAt = new Date();

      await tx.resolutionReport.upsert({
        where: { concernId: id },
        update: {
          summary: input.summary,
          actionsTaken: input.actionsTaken,
          evidenceUrl: input.evidenceUrl,
          resolvedById: actorId,
          resolvedAt
        },
        create: {
          concernId: id,
          summary: input.summary,
          actionsTaken: input.actionsTaken,
          evidenceUrl: input.evidenceUrl,
          resolvedById: actorId,
          resolvedAt
        }
      });

      await tx.concern.update({
        where: { id },
        data: {
          status: ConcernStatus.AWAITING_CONFIRMATION,
          resolvedAt: null
        }
      });

      await createTimeline(tx, id, actorId, "RESOLUTION_SUBMITTED", "Resolution report submitted");
      await createTimeline(
        tx,
        id,
        actorId,
        "AWAITING_CONFIRMATION",
        "Waiting for student confirmation"
      );

      return tx.concern.findUniqueOrThrow({
        where: { id },
        include: concernDetailInclude
      });
    });
  },

  async rejectResolution(id: string, studentId: string, actorId: string, reason: string) {
    return prisma.$transaction(async (tx) => {
      await tx.reopenRequest.create({
        data: {
          concernId: id,
          studentId,
          reason
        }
      });
      await tx.concern.update({
        where: { id },
        data: {
          status: ConcernStatus.REOPENED,
          resolvedAt: null
        }
      });
      await createTimeline(
        tx,
        id,
        actorId,
        "REOPENED",
        `Resolution rejected by student: ${reason}`
      );

      return tx.concern.findUniqueOrThrow({
        where: { id },
        include: concernDetailInclude
      });
    });
  },

  async addSupport(id: string, studentId: string, actorId: string) {
    return prisma.$transaction(async (tx) => {
      const support = await tx.concernSupport.create({
        data: {
          concernId: id,
          studentId
        }
      });
      await createTimeline(
        tx,
        id,
        actorId,
        "SUPPORTED",
        "A student reported also experiencing this concern"
      );

      return support;
    });
  },

  async addAttachment(id: string, actorId: string, input: CreateAttachmentInput) {
    return prisma.$transaction(async (tx) => {
      const attachment = await tx.concernAttachment.create({
        data: {
          concernId: id,
          ...input
        }
      });
      await createTimeline(
        tx,
        id,
        actorId,
        "ATTACHMENT_ADDED",
        `Image attachment added: ${input.fileName}`
      );

      return attachment;
    });
  },

  findTimeline(id: string) {
    return prisma.concernTimeline.findMany({
      where: { concernId: id },
      include: {
        actor: { select: userSummarySelect }
      },
      orderBy: { createdAt: "asc" }
    });
  },

  buildWhere(
    actor: { id: string; role: UserRole },
    query: ConcernListQuery,
    scope?: { officeId?: string; departmentId?: string }
  ): Prisma.ConcernWhereInput {
    const and: Prisma.ConcernWhereInput[] = [];

    if (actor.role === UserRole.STUDENT) {
      and.push({
        OR: [{ submittedBy: { userId: actor.id } }, { visibility: "PUBLIC" }]
      });
    } else if (actor.role === UserRole.OFFICE_STAFF) {
      and.push({ targetOfficeId: scope?.officeId });
    } else if (actor.role === UserRole.DEAN || actor.role === UserRole.CHAIR) {
      and.push({ targetDepartmentId: scope?.departmentId });
    }

    if (query.status) and.push({ status: query.status });
    if (query.targetType) and.push({ targetType: query.targetType });
    if (query.targetOfficeId) and.push({ targetOfficeId: query.targetOfficeId });
    if (query.targetDepartmentId) and.push({ targetDepartmentId: query.targetDepartmentId });
    if (query.search) {
      and.push({
        OR: [
          { referenceNumber: { contains: query.search, mode: "insensitive" } },
          { title: { contains: query.search, mode: "insensitive" } },
          { description: { contains: query.search, mode: "insensitive" } }
        ]
      });
    }

    return and.length > 0 ? { AND: and } : {};
  }
};

async function createTimeline(
  tx: PrismaTransaction,
  concernId: string,
  actorId: string,
  eventType: string,
  description: string
): Promise<void> {
  await tx.concernTimeline.create({
    data: {
      concernId,
      actorId,
      eventType,
      description
    }
  });
}

import { randomBytes } from "node:crypto";

import {
  ConcernStatus,
  ConcernTargetType,
  ConcernVisibility,
  Prisma,
  UserRole
} from "@prisma/client";

import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError
} from "../../../shared/errors";
import { AuthenticatedUser } from "../../../shared/types/auth.types";
import { getPagination } from "../../../shared/utils/pagination";
import { concernRepository } from "../repository/concern.repository";
import {
  ConcernListQuery,
  CreateAttachmentInput,
  CreateConcernInput,
  CreateResolutionInput,
  RejectResolutionInput,
  TransferConcernInput,
  UpdateConcernStatusInput
} from "../types/concern.types";

type ConcernAccessRecord = NonNullable<
  Awaited<ReturnType<typeof concernRepository.findAccessRecord>>
>;

const TRANSFERABLE_STATUSES = new Set<ConcernStatus>([
  ConcernStatus.SUBMITTED,
  ConcernStatus.UNDER_REVIEW,
  ConcernStatus.IN_PROGRESS,
  ConcernStatus.TRANSFERRED,
  ConcernStatus.REOPENED
]);

const RESOLVABLE_STATUSES = new Set<ConcernStatus>([
  ConcernStatus.UNDER_REVIEW,
  ConcernStatus.IN_PROGRESS,
  ConcernStatus.REOPENED
]);

export const concernService = {
  async createConcern(input: CreateConcernInput, actor: AuthenticatedUser) {
    const student = await requireStudent(actor);
    await validateTarget(input.targetType, input.targetOfficeId, input.targetDepartmentId);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await concernRepository.createConcern(
          input,
          student.id,
          actor.id,
          generateReferenceNumber()
        );
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002" &&
          attempt < 2
        ) {
          continue;
        }
        throw error;
      }
    }

    throw new ConflictError("Unable to generate a unique concern reference number");
  },

  async getConcerns(actor: AuthenticatedUser, query: ConcernListQuery) {
    const scope = await getActorScope(actor);
    const where = concernRepository.buildWhere(actor, query, scope);
    const { skip, take } = getPagination(query);
    const [concerns, total] = await Promise.all([
      concernRepository.findAll(where, query, skip, take),
      concernRepository.count(where)
    ]);

    return {
      data: concerns,
      meta: {
        page: query.page,
        limit: query.limit,
        total
      }
    };
  },

  async getConcernById(id: string, actor: AuthenticatedUser) {
    const access = await getConcernAccess(id);
    await assertCanViewConcern(actor, access);

    const concern = await concernRepository.findById(id);
    if (!concern) throw new NotFoundError("Concern not found");

    return concern;
  },

  async updateConcernStatus(id: string, input: UpdateConcernStatusInput, actor: AuthenticatedUser) {
    const access = await getConcernAccess(id);
    await assertCanHandleConcern(actor, access);

    if (input.status === ConcernStatus.CLOSED) {
      if (actor.role !== UserRole.ADMIN) {
        throw new ForbiddenError("Only administrators can close concerns");
      }
      if (access.status === ConcernStatus.CLOSED) {
        throw new ConflictError("Concern is already closed");
      }
    } else {
      assertStatusTransition(access.status, input.status);
    }

    return concernRepository.updateStatus(
      id,
      input.status,
      actor.id,
      statusDescription(input.status)
    );
  },

  async transferConcern(id: string, input: TransferConcernInput, actor: AuthenticatedUser) {
    const access = await getConcernAccess(id);
    await assertCanHandleConcern(actor, access);

    if (!TRANSFERABLE_STATUSES.has(access.status)) {
      throw new ConflictError(`Concern cannot be transferred from ${access.status}`);
    }

    await validateTarget(input.toTargetType, input.toOfficeId, input.toDepartmentId);

    const isSameOffice =
      input.toTargetType === ConcernTargetType.OFFICE &&
      access.targetType === ConcernTargetType.OFFICE &&
      input.toOfficeId === access.targetOfficeId;
    const isSameDepartment =
      input.toTargetType === ConcernTargetType.DEPARTMENT &&
      access.targetType === ConcernTargetType.DEPARTMENT &&
      input.toDepartmentId === access.targetDepartmentId;

    if (isSameOffice || isSameDepartment) {
      throw new BadRequestError("Transfer target must differ from the current target");
    }

    return concernRepository.transfer(id, actor.id, input, {
      targetType: access.targetType,
      targetOfficeId: access.targetOfficeId,
      targetDepartmentId: access.targetDepartmentId
    });
  },

  async createResolution(id: string, input: CreateResolutionInput, actor: AuthenticatedUser) {
    const access = await getConcernAccess(id);
    await assertCanHandleConcern(actor, access);

    if (!RESOLVABLE_STATUSES.has(access.status)) {
      throw new ConflictError(`Concern cannot be resolved from ${access.status}`);
    }

    return concernRepository.createResolution(id, actor.id, input);
  },

  async confirmResolution(id: string, actor: AuthenticatedUser) {
    const { access } = await requireConcernOwner(id, actor);

    if (access.status !== ConcernStatus.AWAITING_CONFIRMATION) {
      throw new ConflictError("Concern is not awaiting student confirmation");
    }
    if (!access.resolutionReport) {
      throw new ConflictError("Concern has no resolution report");
    }

    return concernRepository.updateStatus(
      id,
      ConcernStatus.RESOLVED,
      actor.id,
      "Student confirmed the resolution"
    );
  },

  async rejectResolution(id: string, input: RejectResolutionInput, actor: AuthenticatedUser) {
    const { access, student } = await requireConcernOwner(id, actor);

    if (access.status !== ConcernStatus.AWAITING_CONFIRMATION) {
      throw new ConflictError("Concern is not awaiting student confirmation");
    }
    if (!access.resolutionReport) {
      throw new ConflictError("Concern has no resolution report");
    }

    return concernRepository.rejectResolution(id, student.id, actor.id, input.reason);
  },

  async addSupport(id: string, actor: AuthenticatedUser) {
    const student = await requireStudent(actor);
    const access = await getConcernAccess(id);

    if (access.visibility !== ConcernVisibility.PUBLIC) {
      throw new ForbiddenError("Only public concerns can receive support");
    }
    if (access.submittedBy.userId === actor.id) {
      throw new ConflictError("You cannot support your own concern");
    }

    try {
      return await concernRepository.addSupport(id, student.id, actor.id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictError("You already support this concern");
      }
      throw error;
    }
  },

  async addAttachment(id: string, input: CreateAttachmentInput, actor: AuthenticatedUser) {
    await this.assertCanAddAttachment(id, actor);
    return concernRepository.addAttachment(id, actor.id, input);
  },

  async assertCanAddAttachment(id: string, actor: AuthenticatedUser) {
    const access = await getConcernAccess(id);

    if (actor.role === UserRole.STUDENT) {
      if (access.submittedBy.userId !== actor.id) {
        throw new ForbiddenError("You can only attach images to your own concerns");
      }
    } else {
      await assertCanHandleConcern(actor, access);
    }
  },

  async getTimeline(id: string, actor: AuthenticatedUser) {
    const access = await getConcernAccess(id);
    await assertCanViewConcern(actor, access);
    return concernRepository.findTimeline(id);
  }
};

async function getConcernAccess(id: string): Promise<ConcernAccessRecord> {
  const concern = await concernRepository.findAccessRecord(id);
  if (!concern) throw new NotFoundError("Concern not found");
  return concern;
}

async function requireStudent(actor: AuthenticatedUser) {
  if (actor.role !== UserRole.STUDENT) {
    throw new ForbiddenError("A student account is required");
  }

  const student = await concernRepository.findStudentByUserId(actor.id);
  if (!student) throw new ForbiddenError("Student profile not found");
  return student;
}

async function requireConcernOwner(id: string, actor: AuthenticatedUser) {
  const student = await requireStudent(actor);
  const access = await getConcernAccess(id);

  if (access.submittedBy.userId !== actor.id) {
    throw new ForbiddenError("You can only validate your own concern");
  }

  return { access, student };
}

async function getActorScope(actor: AuthenticatedUser) {
  if (actor.role === UserRole.OFFICE_STAFF) {
    const profile = await concernRepository.findOfficeStaffByUserId(actor.id);
    if (!profile) throw new ForbiddenError("Office staff profile not found");
    return { officeId: profile.officeId };
  }

  if (actor.role === UserRole.DEAN || actor.role === UserRole.CHAIR) {
    const profile = await concernRepository.findFacultyByUserId(actor.id);
    if (!profile) throw new ForbiddenError("Faculty profile not found");
    return { departmentId: profile.departmentId };
  }

  return {};
}

async function assertCanViewConcern(
  actor: AuthenticatedUser,
  concern: ConcernAccessRecord
): Promise<void> {
  if (actor.role === UserRole.ADMIN) return;

  if (actor.role === UserRole.STUDENT) {
    if (
      concern.submittedBy.userId === actor.id ||
      concern.visibility === ConcernVisibility.PUBLIC
    ) {
      return;
    }
    throw new ForbiddenError("You cannot view this concern");
  }

  await assertCanHandleConcern(actor, concern);
}

async function assertCanHandleConcern(
  actor: AuthenticatedUser,
  concern: ConcernAccessRecord
): Promise<void> {
  if (actor.role === UserRole.ADMIN) return;

  if (actor.role === UserRole.OFFICE_STAFF) {
    const profile = await concernRepository.findOfficeStaffByUserId(actor.id);
    if (profile?.officeId === concern.targetOfficeId) return;
    throw new ForbiddenError("Concern is not assigned to your office");
  }

  if (actor.role === UserRole.DEAN || actor.role === UserRole.CHAIR) {
    const profile = await concernRepository.findFacultyByUserId(actor.id);
    if (profile?.departmentId === concern.targetDepartmentId) return;
    throw new ForbiddenError("Concern is not assigned to your department");
  }

  throw new ForbiddenError("You cannot manage concerns");
}

async function validateTarget(
  targetType: ConcernTargetType,
  officeId?: string | null,
  departmentId?: string | null
): Promise<void> {
  if (targetType === ConcernTargetType.OFFICE) {
    if (!officeId || departmentId) {
      throw new BadRequestError("Office target requires only targetOfficeId");
    }
    if (!(await concernRepository.findOfficeById(officeId))) {
      throw new BadRequestError("Target office does not exist");
    }
    return;
  }

  if (!departmentId || officeId) {
    throw new BadRequestError("Department target requires only targetDepartmentId");
  }
  if (!(await concernRepository.findDepartmentById(departmentId))) {
    throw new BadRequestError("Target department does not exist");
  }
}

function assertStatusTransition(current: ConcernStatus, next: ConcernStatus): void {
  const allowed: Partial<Record<ConcernStatus, ConcernStatus[]>> = {
    [ConcernStatus.SUBMITTED]: [ConcernStatus.UNDER_REVIEW],
    [ConcernStatus.TRANSFERRED]: [ConcernStatus.UNDER_REVIEW],
    [ConcernStatus.UNDER_REVIEW]: [ConcernStatus.IN_PROGRESS],
    [ConcernStatus.REOPENED]: [ConcernStatus.UNDER_REVIEW, ConcernStatus.IN_PROGRESS]
  };

  if (!allowed[current]?.includes(next)) {
    throw new ConflictError(`Invalid status transition from ${current} to ${next}`);
  }
}

function statusDescription(status: ConcernStatus): string {
  const descriptions: Record<ConcernStatus, string> = {
    SUBMITTED: "Concern submitted",
    UNDER_REVIEW: "Concern is under review",
    IN_PROGRESS: "Work on the concern is in progress",
    TRANSFERRED: "Concern transferred",
    AWAITING_CONFIRMATION: "Waiting for student confirmation",
    REOPENED: "Concern reopened",
    RESOLVED: "Concern resolved",
    CLOSED: "Concern administratively closed"
  };

  return descriptions[status];
}

function generateReferenceNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `CARES-${date}-${suffix}`;
}

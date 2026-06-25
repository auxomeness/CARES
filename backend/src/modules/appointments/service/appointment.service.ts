import { AppointmentStatus, AppointmentTargetType, Prisma, UserRole } from "@prisma/client";

import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError
} from "../../../shared/errors";
import { AuthenticatedUser } from "../../../shared/types/auth.types";
import { getPagination } from "../../../shared/utils/pagination";
import { logger } from "../../../shared/utils/logger";
import { publishNotificationEvent } from "../../notifications/service/notification.events";
import { NotificationEventType } from "../../notifications/types/notification.types";
import { availabilityService } from "../availability/availability.service";
import { appointmentRepository } from "../repository/appointment.repository";
import {
  AppointmentListQuery,
  AppointmentTarget,
  CreateAppointmentInput,
  RejectAppointmentInput,
  RescheduleAppointmentInput
} from "../types/appointment.types";

type AppointmentAccessRecord = NonNullable<
  Awaited<ReturnType<typeof appointmentRepository.findAccessRecord>>
>;

const APPROVABLE_STATUSES = new Set<AppointmentStatus>([
  AppointmentStatus.PENDING,
  AppointmentStatus.RESCHEDULED
]);
const CANCELLABLE_STATUSES = new Set<AppointmentStatus>([
  AppointmentStatus.PENDING,
  AppointmentStatus.APPROVED,
  AppointmentStatus.RESCHEDULED
]);
const RESCHEDULABLE_STATUSES = new Set<AppointmentStatus>([
  AppointmentStatus.PENDING,
  AppointmentStatus.APPROVED,
  AppointmentStatus.RESCHEDULED
]);

export const appointmentService = {
  async createAppointment(input: CreateAppointmentInput, actor: AuthenticatedUser) {
    const student = await requireStudent(actor);
    const target = appointmentTarget(input);
    await validateTarget(target);

    const startTime = new Date(input.startTime);
    const endTime = new Date(input.endTime);
    validateFutureTimeRange(startTime, endTime);
    await availabilityService.checkAvailability(target, startTime, endTime);

    try {
      const appointment = await appointmentRepository.create(input, student.id);
      if (!appointment) throw new ConflictError("Time slot not available");
      publishAppointmentEvent(NotificationEventType.APPOINTMENT_CREATED, appointment, actor.id);
      return appointment;
    } catch (error) {
      throw normalizeConflictError(error);
    }
  },

  async getAppointments(actor: AuthenticatedUser, query: AppointmentListQuery) {
    const scope = await getActorScope(actor);
    const where = appointmentRepository.buildWhere(actor, query, scope);
    const { skip, take } = getPagination(query);
    const [appointments, total] = await Promise.all([
      appointmentRepository.findAll(where, skip, take),
      appointmentRepository.count(where)
    ]);

    return {
      data: appointments,
      meta: {
        page: query.page,
        limit: query.limit,
        total
      }
    };
  },

  async getAppointmentById(id: string, actor: AuthenticatedUser) {
    const access = await getAppointmentAccess(id);
    await assertCanViewAppointment(actor, access);

    const appointment = await appointmentRepository.findById(id);
    if (!appointment) throw new NotFoundError("Appointment not found");
    return appointment;
  },

  async approveAppointment(id: string, actor: AuthenticatedUser) {
    const access = await getAppointmentAccess(id);
    await assertCanHandleAppointment(actor, access);
    if (!APPROVABLE_STATUSES.has(access.status)) {
      throw new ConflictError(`Appointment cannot be approved from ${access.status}`);
    }

    const appointment = await appointmentRepository.updateStatus(id, AppointmentStatus.APPROVED, {
      rejectionReason: null
    });
    publishAppointmentEvent(NotificationEventType.APPOINTMENT_APPROVED, appointment, actor.id);
    logAppointmentAction("appointment_approved", appointment.id, actor.id);
    return appointment;
  },

  async rejectAppointment(id: string, input: RejectAppointmentInput, actor: AuthenticatedUser) {
    const access = await getAppointmentAccess(id);
    await assertCanHandleAppointment(actor, access);
    if (!APPROVABLE_STATUSES.has(access.status)) {
      throw new ConflictError(`Appointment cannot be rejected from ${access.status}`);
    }

    const appointment = await appointmentRepository.updateStatus(id, AppointmentStatus.REJECTED, {
      rejectionReason: input.reason
    });
    publishAppointmentEvent(
      NotificationEventType.APPOINTMENT_REJECTED,
      appointment,
      actor.id,
      input.reason
    );
    logAppointmentAction("appointment_rejected", appointment.id, actor.id);
    return appointment;
  },

  async cancelAppointment(id: string, actor: AuthenticatedUser) {
    const access = await getAppointmentAccess(id);
    if (actor.role !== UserRole.ADMIN && access.student.userId !== actor.id) {
      throw new ForbiddenError("Only the student or an administrator can cancel");
    }
    if (!CANCELLABLE_STATUSES.has(access.status)) {
      throw new ConflictError(`Appointment cannot be cancelled from ${access.status}`);
    }

    const appointment = await appointmentRepository.updateStatus(id, AppointmentStatus.CANCELLED, {
      cancelledAt: new Date()
    });
    publishAppointmentEvent(NotificationEventType.APPOINTMENT_CANCELLED, appointment, actor.id);
    logAppointmentAction("appointment_cancelled", appointment.id, actor.id);
    return appointment;
  },

  async rescheduleAppointment(
    id: string,
    input: RescheduleAppointmentInput,
    actor: AuthenticatedUser
  ) {
    const access = await getAppointmentAccess(id);
    await assertCanRescheduleAppointment(actor, access);
    if (!RESCHEDULABLE_STATUSES.has(access.status)) {
      throw new ConflictError(`Appointment cannot be rescheduled from ${access.status}`);
    }

    const startTime = new Date(input.newStartTime);
    const endTime = new Date(input.newEndTime);
    validateFutureTimeRange(startTime, endTime);
    const target = appointmentTarget(access);
    await availabilityService.checkAvailability(target, startTime, endTime);

    try {
      const appointment = await appointmentRepository.reschedule(
        id,
        access.studentId,
        actor.id,
        input,
        target
      );
      if (!appointment) throw new ConflictError("Time slot not available");
      publishAppointmentEvent(
        NotificationEventType.APPOINTMENT_RESCHEDULED,
        appointment,
        actor.id,
        input.reason
      );
      logAppointmentAction("appointment_rescheduled", appointment.id, actor.id);
      return appointment;
    } catch (error) {
      throw normalizeConflictError(error);
    }
  },

  async completeAppointment(id: string, actor: AuthenticatedUser) {
    const access = await getAppointmentAccess(id);
    await assertCanHandleAppointment(actor, access);
    if (access.status !== AppointmentStatus.APPROVED) {
      throw new ConflictError("Only approved appointments can be completed");
    }

    const appointment = await appointmentRepository.updateStatus(id, AppointmentStatus.COMPLETED, {
      completedAt: new Date()
    });
    publishAppointmentEvent(NotificationEventType.APPOINTMENT_COMPLETED, appointment, actor.id);
    logAppointmentAction("appointment_completed", appointment.id, actor.id);
    return appointment;
  },

  async detectConflicts(input: CreateAppointmentInput, actor: AuthenticatedUser): Promise<boolean> {
    const student = await requireStudent(actor);
    const target = appointmentTarget(input);
    await validateTarget(target);
    await availabilityService.checkAvailability(
      target,
      new Date(input.startTime),
      new Date(input.endTime)
    );

    const result = await appointmentRepository.detectConflict(
      student.id,
      target,
      new Date(input.startTime),
      new Date(input.endTime)
    );
    return Boolean(result);
  }
};

async function getAppointmentAccess(id: string): Promise<AppointmentAccessRecord> {
  const appointment = await appointmentRepository.findAccessRecord(id);
  if (!appointment) throw new NotFoundError("Appointment not found");
  return appointment;
}

async function requireStudent(actor: AuthenticatedUser) {
  if (actor.role !== UserRole.STUDENT) {
    throw new ForbiddenError("A student account is required");
  }
  const student = await appointmentRepository.findStudentByUserId(actor.id);
  if (!student) throw new ForbiddenError("Student profile not found");
  return student;
}

async function getActorScope(actor: AuthenticatedUser) {
  if (actor.role === UserRole.STUDENT) {
    const student = await requireStudent(actor);
    return { studentId: student.id };
  }
  if (actor.role === UserRole.OFFICE_STAFF) {
    const profile = await appointmentRepository.findOfficeStaffByUserId(actor.id);
    if (!profile) throw new ForbiddenError("Office staff profile not found");
    return { officeId: profile.officeId };
  }
  if (
    actor.role === UserRole.DEAN ||
    actor.role === UserRole.CHAIR ||
    actor.role === UserRole.PROFESSOR
  ) {
    const profile = await appointmentRepository.findFacultyByUserId(actor.id);
    if (!profile) throw new ForbiddenError("Faculty profile not found");
    return {
      departmentId: profile.departmentId,
      facultyId: profile.id
    };
  }
  return {};
}

async function assertCanViewAppointment(
  actor: AuthenticatedUser,
  appointment: AppointmentAccessRecord
): Promise<void> {
  if (actor.role === UserRole.ADMIN) return;
  if (actor.role === UserRole.STUDENT) {
    if (appointment.student.userId === actor.id) return;
    throw new ForbiddenError("You can only view your own appointments");
  }
  await assertCanHandleAppointment(actor, appointment);
}

async function assertCanHandleAppointment(
  actor: AuthenticatedUser,
  appointment: AppointmentAccessRecord
): Promise<void> {
  if (actor.role === UserRole.ADMIN) return;

  if (actor.role === UserRole.OFFICE_STAFF) {
    const profile = await appointmentRepository.findOfficeStaffByUserId(actor.id);
    if (
      appointment.targetType === AppointmentTargetType.OFFICE &&
      profile?.officeId === appointment.officeId
    ) {
      return;
    }
  }

  if (actor.role === UserRole.PROFESSOR) {
    const profile = await appointmentRepository.findFacultyByUserId(actor.id);
    if (
      appointment.targetType === AppointmentTargetType.PROFESSOR &&
      profile?.id === appointment.facultyId
    ) {
      return;
    }
  }

  if (actor.role === UserRole.DEAN || actor.role === UserRole.CHAIR) {
    const profile = await appointmentRepository.findFacultyByUserId(actor.id);
    if (
      profile &&
      ((appointment.targetType === AppointmentTargetType.DEPARTMENT &&
        profile.departmentId === appointment.departmentId) ||
        (appointment.targetType === AppointmentTargetType.PROFESSOR &&
          profile.departmentId === appointment.faculty?.departmentId))
    ) {
      return;
    }
  }

  throw new ForbiddenError("Appointment is not assigned to you");
}

async function assertCanRescheduleAppointment(
  actor: AuthenticatedUser,
  appointment: AppointmentAccessRecord
): Promise<void> {
  if (actor.role === UserRole.ADMIN || appointment.student.userId === actor.id) return;
  await assertCanHandleAppointment(actor, appointment);
}

async function validateTarget(target: AppointmentTarget): Promise<void> {
  const selected = [target.officeId, target.departmentId, target.facultyId].filter(Boolean);
  if (selected.length !== 1) {
    throw new BadRequestError("Select exactly one appointment target");
  }

  if (target.targetType === AppointmentTargetType.OFFICE) {
    if (!target.officeId || target.departmentId || target.facultyId) {
      throw new BadRequestError("Office appointment requires only officeId");
    }
    if (!(await appointmentRepository.findOfficeById(target.officeId))) {
      throw new BadRequestError("Target office does not exist");
    }
    return;
  }

  if (target.targetType === AppointmentTargetType.DEPARTMENT) {
    if (!target.departmentId || target.officeId || target.facultyId) {
      throw new BadRequestError("Department appointment requires only departmentId");
    }
    if (!(await appointmentRepository.findDepartmentById(target.departmentId))) {
      throw new BadRequestError("Target department does not exist");
    }
    return;
  }

  if (!target.facultyId || target.officeId || target.departmentId) {
    throw new BadRequestError("Professor appointment requires only facultyId");
  }
  const faculty = await appointmentRepository.findFacultyById(target.facultyId);
  if (!faculty?.user.isActive) {
    throw new BadRequestError("Target faculty member does not exist or is inactive");
  }
}

function appointmentTarget(input: AppointmentTarget): AppointmentTarget {
  return {
    targetType: input.targetType,
    officeId: input.officeId,
    departmentId: input.departmentId,
    facultyId: input.facultyId
  };
}

function validateFutureTimeRange(startTime: Date, endTime: Date): void {
  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    throw new BadRequestError("Appointment time is invalid");
  }
  if (endTime <= startTime) {
    throw new BadRequestError("End time must be after start time");
  }
  if (startTime <= new Date()) {
    throw new BadRequestError("Appointment must be scheduled in the future");
  }
}

function normalizeConflictError(error: unknown): Error {
  if (error instanceof ConflictError) return error;
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    ["P2004", "P2034"].includes(error.code)
  ) {
    return new ConflictError("Time slot not available");
  }
  if (
    error instanceof Error &&
    (error.message.includes("deadlock detected") ||
      error.message.includes("conflicting key value violates exclusion constraint") ||
      error.message.includes("could not serialize access"))
  ) {
    return new ConflictError("Time slot not available");
  }
  return error instanceof Error ? error : new Error("Appointment operation failed");
}

function publishAppointmentEvent(
  type: NotificationEventType,
  appointment: Awaited<ReturnType<typeof appointmentRepository.updateStatus>>,
  actorUserId: string,
  reason?: string
): void {
  publishNotificationEvent({
    type,
    resourceId: appointment.id,
    resourceTitle: appointment.title,
    studentUserId: appointment.student.user.id,
    actorUserId,
    targetType: appointment.targetType,
    officeId: appointment.officeId,
    departmentId: appointment.departmentId,
    facultyId: appointment.facultyId,
    reason,
    startTime: appointment.startTime,
    endTime: appointment.endTime
  });
}

function logAppointmentAction(action: string, appointmentId: string, actorUserId: string): void {
  logger.info({ action, appointmentId, actorUserId }, "Appointment state changed");
}

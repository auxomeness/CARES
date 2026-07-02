import { AppointmentTargetType, UserRole } from "@prisma/client";

import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError
} from "../../../shared/errors";
import { AuthenticatedUser } from "../../../shared/types/auth.types";
import { appointmentRepository } from "../repository/appointment.repository";
import {
  AppointmentTarget,
  AvailabilityLookupQuery,
  BookableSlotsQuery,
  CreateAvailabilityInput,
  UpdateAvailabilityInput
} from "../types/appointment.types";
import { availabilityRepository } from "./availability.repository";

export const availabilityService = {
  async createAvailability(input: CreateAvailabilityInput, actor: AuthenticatedUser) {
    const target = await resolveAvailabilityTarget(actor, input);
    await ensureTargetExists(target);
    validateAvailabilityWindow(input.startTime, input.endTime, input.slotDuration);
    if (input.isActive) {
      const overlap = await findAvailabilityOverlap(
        target,
        input.dayOfWeek,
        input.startTime,
        input.endTime
      );
      if (overlap) {
        if (
          overlap.startTime === input.startTime &&
          overlap.endTime === input.endTime &&
          overlap.slotDuration === input.slotDuration
        ) {
          return overlap;
        }
        throw new ConflictError("Availability window overlaps an existing schedule");
      }
    }

    return availabilityRepository.create(input, actor.id, target);
  },

  async getAvailability(ownerId: string, query: AvailabilityLookupQuery) {
    const availability = await availabilityRepository.findTargetsByOwnerId(
      ownerId,
      query.targetType
    );

    if (availability.length === 0) {
      await ensureOwnerExists(ownerId, query.targetType);
    }

    return availability;
  },

  async getBookableSlots(ownerId: string, query: BookableSlotsQuery) {
    const target = targetFromOwnerId(ownerId, query.targetType);
    await ensureTargetExists(target);

    const dayStart = new Date(`${query.date}T00:00:00+08:00`);
    const dayEnd = new Date(`${query.date}T23:59:59.999+08:00`);
    if (Number.isNaN(dayStart.getTime())) {
      throw new BadRequestError("Invalid booking date");
    }

    const dayOfWeek = getManilaDateParts(dayStart).dayOfWeek;
    const [schedules, reserved] = await Promise.all([
      availabilityRepository.findForDay(target, dayOfWeek),
      appointmentRepository.findReservedTimes(target, dayStart, dayEnd)
    ]);

    return schedules.flatMap((schedule) => {
      const slots: Array<{ startTime: string; endTime: string }> = [];
      const windowStart = toMinutes(schedule.startTime);
      const windowEnd = toMinutes(schedule.endTime);

      for (
        let slotStart = windowStart;
        slotStart + schedule.slotDuration <= windowEnd;
        slotStart += schedule.slotDuration
      ) {
        const startTime = new Date(`${query.date}T${fromMinutes(slotStart)}:00+08:00`);
        const endTime = new Date(
          `${query.date}T${fromMinutes(slotStart + schedule.slotDuration)}:00+08:00`
        );
        const overlaps = reserved.some(
          (appointment) => appointment.startTime < endTime && appointment.endTime > startTime
        );

        if (!overlaps && startTime > new Date()) {
          slots.push({
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
          });
        }
      }

      return slots;
    });
  },

  async updateAvailability(id: string, input: UpdateAvailabilityInput, actor: AuthenticatedUser) {
    const current = await availabilityRepository.findById(id);
    if (!current) throw new NotFoundError("Availability schedule not found");

    await assertCanManageTarget(actor, current);

    const dayOfWeek = input.dayOfWeek ?? current.dayOfWeek;
    const startTime = input.startTime ?? current.startTime;
    const endTime = input.endTime ?? current.endTime;
    const slotDuration = input.slotDuration ?? current.slotDuration;
    const isActive = input.isActive ?? current.isActive;
    validateAvailabilityWindow(startTime, endTime, slotDuration);

    const target = availabilityTargetFromRecord(current);
    const schedules = await availabilityRepository.findByTarget(target, true);
    if (
      isActive &&
      schedules.some(
        (schedule) =>
          schedule.id !== id &&
          schedule.dayOfWeek === dayOfWeek &&
          startTime < schedule.endTime &&
          endTime > schedule.startTime
      )
    ) {
      throw new ConflictError("Availability window overlaps an existing schedule");
    }

    return availabilityRepository.update(id, input);
  },

  async deleteAvailability(id: string, actor: AuthenticatedUser) {
    const current = await availabilityRepository.findById(id);
    if (!current) throw new NotFoundError("Availability schedule not found");

    await assertCanManageTarget(actor, current);
    return availabilityRepository.delete(id);
  },

  async checkAvailability(target: AppointmentTarget, startTime: Date, endTime: Date) {
    const local = getManilaDateParts(startTime);
    const endLocal = getManilaDateParts(endTime);

    if (local.date !== endLocal.date) {
      throw new ConflictError("Appointment must start and end on the same local date");
    }

    const schedules = await availabilityRepository.findForDay(target, local.dayOfWeek);
    const schedule = schedules.find(
      (candidate) =>
        local.time >= candidate.startTime &&
        endLocal.time <= candidate.endTime &&
        durationMinutes(startTime, endTime) === candidate.slotDuration &&
        isAlignedToSlot(local.time, candidate.startTime, candidate.slotDuration)
    );

    if (!schedule) {
      throw new ConflictError("Time slot not available");
    }

    return schedule;
  }
};

async function resolveAvailabilityTarget(
  actor: AuthenticatedUser,
  input: CreateAvailabilityInput
): Promise<AppointmentTarget> {
  if (actor.role === UserRole.OFFICE_STAFF) {
    const profile = await appointmentRepository.findOfficeStaffByUserId(actor.id);
    if (!profile) throw new ForbiddenError("Office staff profile not found");
    return { targetType: AppointmentTargetType.OFFICE, officeId: profile.officeId };
  }

  if (actor.role === UserRole.PROFESSOR) {
    const profile = await appointmentRepository.findFacultyByUserId(actor.id);
    if (!profile) throw new ForbiddenError("Faculty profile not found");
    return { targetType: AppointmentTargetType.PROFESSOR, facultyId: profile.id };
  }

  if (actor.role === UserRole.DEAN || actor.role === UserRole.CHAIR) {
    const profile = await appointmentRepository.findFacultyByUserId(actor.id);
    if (!profile) throw new ForbiddenError("Faculty profile not found");

    if (input.targetType === AppointmentTargetType.PROFESSOR) {
      if (input.facultyId && input.facultyId !== profile.id) {
        throw new ForbiddenError("You can only create personal consultation availability");
      }
      return { targetType: AppointmentTargetType.PROFESSOR, facultyId: profile.id };
    }

    if (input.targetType && input.targetType !== AppointmentTargetType.DEPARTMENT) {
      throw new ForbiddenError("Dean and chair availability must target their department");
    }
    return {
      targetType: AppointmentTargetType.DEPARTMENT,
      departmentId: profile.departmentId
    };
  }

  if (actor.role === UserRole.ADMIN) {
    if (!input.targetType) {
      throw new BadRequestError("Administrator must specify an availability target");
    }
    return {
      targetType: input.targetType,
      officeId: input.officeId,
      departmentId: input.departmentId,
      facultyId: input.facultyId
    };
  }

  throw new ForbiddenError("You cannot manage availability schedules");
}

async function assertCanManageTarget(
  actor: AuthenticatedUser,
  availability: {
    targetType: AppointmentTargetType;
    officeId: string | null;
    departmentId: string | null;
    facultyId: string | null;
  }
): Promise<void> {
  if (actor.role === UserRole.ADMIN) return;

  if (actor.role === UserRole.OFFICE_STAFF) {
    const profile = await appointmentRepository.findOfficeStaffByUserId(actor.id);
    if (profile?.officeId === availability.officeId) return;
  }

  if (actor.role === UserRole.PROFESSOR) {
    const profile = await appointmentRepository.findFacultyByUserId(actor.id);
    if (profile?.id === availability.facultyId) return;
  }

  if (actor.role === UserRole.DEAN || actor.role === UserRole.CHAIR) {
    const profile = await appointmentRepository.findFacultyByUserId(actor.id);
    if (
      profile &&
      (profile.departmentId === availability.departmentId || profile.id === availability.facultyId)
    ) {
      return;
    }
  }

  throw new ForbiddenError("You cannot manage this availability schedule");
}

async function ensureTargetExists(target: AppointmentTarget): Promise<void> {
  if (
    target.targetType === AppointmentTargetType.OFFICE &&
    (!target.officeId || !(await appointmentRepository.findOfficeById(target.officeId)))
  ) {
    throw new BadRequestError("Target office does not exist");
  }
  if (
    target.targetType === AppointmentTargetType.DEPARTMENT &&
    (!target.departmentId || !(await appointmentRepository.findDepartmentById(target.departmentId)))
  ) {
    throw new BadRequestError("Target department does not exist");
  }
  if (target.targetType === AppointmentTargetType.PROFESSOR) {
    const faculty = target.facultyId
      ? await appointmentRepository.findFacultyById(target.facultyId)
      : null;
    if (!faculty?.user.isActive) {
      throw new BadRequestError("Target faculty member does not exist or is inactive");
    }
  }
}

async function ensureOwnerExists(
  ownerId: string,
  targetType?: AppointmentTargetType
): Promise<void> {
  const exists =
    (!targetType || targetType === AppointmentTargetType.OFFICE
      ? await appointmentRepository.findOfficeById(ownerId)
      : null) ||
    (!targetType || targetType === AppointmentTargetType.DEPARTMENT
      ? await appointmentRepository.findDepartmentById(ownerId)
      : null) ||
    (!targetType || targetType === AppointmentTargetType.PROFESSOR
      ? await appointmentRepository.findFacultyById(ownerId)
      : null);

  if (!exists) throw new NotFoundError("Availability owner not found");
}

async function findAvailabilityOverlap(
  target: AppointmentTarget,
  dayOfWeek: number,
  startTime: string,
  endTime: string
) {
  const schedules = await availabilityRepository.findByTarget(target, true);
  return schedules.find(
    (schedule) =>
      schedule.dayOfWeek === dayOfWeek &&
      startTime < schedule.endTime &&
      endTime > schedule.startTime
  );
}

function validateAvailabilityWindow(
  startTime: string,
  endTime: string,
  slotDuration: number
): void {
  if (endTime <= startTime) {
    throw new BadRequestError("Availability end time must be after start time");
  }
  if (toMinutes(endTime) - toMinutes(startTime) < slotDuration) {
    throw new BadRequestError("Availability window must contain at least one slot");
  }
}

function availabilityTargetFromRecord(record: {
  targetType: AppointmentTargetType;
  officeId: string | null;
  departmentId: string | null;
  facultyId: string | null;
}): AppointmentTarget {
  return {
    targetType: record.targetType,
    officeId: record.officeId,
    departmentId: record.departmentId,
    facultyId: record.facultyId
  };
}

function targetFromOwnerId(ownerId: string, targetType: AppointmentTargetType): AppointmentTarget {
  if (targetType === AppointmentTargetType.OFFICE) {
    return { targetType, officeId: ownerId };
  }
  if (targetType === AppointmentTargetType.DEPARTMENT) {
    return { targetType, departmentId: ownerId };
  }
  return { targetType, facultyId: ownerId };
}

function getManilaDateParts(value: Date): {
  date: string;
  dayOfWeek: number;
  time: string;
} {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  const weekdays: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7
  };

  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    dayOfWeek: weekdays[part("weekday")],
    time: `${part("hour")}:${part("minute")}`
  };
}

function durationMinutes(startTime: Date, endTime: Date): number {
  return (endTime.getTime() - startTime.getTime()) / 60_000;
}

function isAlignedToSlot(time: string, windowStart: string, slotDuration: number): boolean {
  return (toMinutes(time) - toMinutes(windowStart)) % slotDuration === 0;
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function fromMinutes(value: number): string {
  const hours = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (value % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

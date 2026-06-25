import { AppointmentTargetType, Prisma } from "@prisma/client";

import { prisma } from "../../../config/database";
import {
  AppointmentTarget,
  CreateAvailabilityInput,
  UpdateAvailabilityInput
} from "../types/appointment.types";

const availabilityInclude = {
  ownerUser: {
    select: {
      id: true,
      email: true,
      firstName: true,
      middleName: true,
      lastName: true,
      role: true
    }
  },
  office: true,
  department: true,
  faculty: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          middleName: true,
          lastName: true,
          role: true
        }
      },
      department: { select: { id: true, name: true } }
    }
  }
} as const;

export const availabilityRepository = {
  create(input: CreateAvailabilityInput, actorId: string, target: AppointmentTarget) {
    return prisma.appointmentAvailability.create({
      data: {
        ownerUserId: actorId,
        targetType: target.targetType,
        officeId: target.officeId,
        departmentId: target.departmentId,
        facultyId: target.facultyId,
        dayOfWeek: input.dayOfWeek,
        startTime: input.startTime,
        endTime: input.endTime,
        slotDuration: input.slotDuration,
        isActive: input.isActive
      },
      include: availabilityInclude
    });
  },

  findById(id: string) {
    return prisma.appointmentAvailability.findUnique({
      where: { id },
      include: availabilityInclude
    });
  },

  findByTarget(target: AppointmentTarget, onlyActive = false) {
    return prisma.appointmentAvailability.findMany({
      where: {
        ...targetWhere(target),
        isActive: onlyActive ? true : undefined
      },
      include: availabilityInclude,
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
    });
  },

  findForDay(target: AppointmentTarget, dayOfWeek: number) {
    return prisma.appointmentAvailability.findMany({
      where: {
        ...targetWhere(target),
        dayOfWeek,
        isActive: true
      },
      orderBy: { startTime: "asc" }
    });
  },

  update(id: string, input: UpdateAvailabilityInput) {
    return prisma.appointmentAvailability.update({
      where: { id },
      data: input,
      include: availabilityInclude
    });
  },

  delete(id: string) {
    return prisma.appointmentAvailability.delete({
      where: { id },
      include: availabilityInclude
    });
  },

  findTargetsByOwnerId(ownerId: string, targetType?: AppointmentTargetType) {
    const or: Prisma.AppointmentAvailabilityWhereInput[] = [];

    if (!targetType || targetType === AppointmentTargetType.OFFICE) {
      or.push({ targetType: AppointmentTargetType.OFFICE, officeId: ownerId });
    }
    if (!targetType || targetType === AppointmentTargetType.DEPARTMENT) {
      or.push({ targetType: AppointmentTargetType.DEPARTMENT, departmentId: ownerId });
    }
    if (!targetType || targetType === AppointmentTargetType.PROFESSOR) {
      or.push({ targetType: AppointmentTargetType.PROFESSOR, facultyId: ownerId });
    }

    return prisma.appointmentAvailability.findMany({
      where: { OR: or },
      include: availabilityInclude,
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
    });
  }
};

function targetWhere(target: AppointmentTarget): Prisma.AppointmentAvailabilityWhereInput {
  if (target.targetType === AppointmentTargetType.OFFICE) {
    return {
      targetType: AppointmentTargetType.OFFICE,
      officeId: target.officeId
    };
  }
  if (target.targetType === AppointmentTargetType.DEPARTMENT) {
    return {
      targetType: AppointmentTargetType.DEPARTMENT,
      departmentId: target.departmentId
    };
  }
  return {
    targetType: AppointmentTargetType.PROFESSOR,
    facultyId: target.facultyId
  };
}

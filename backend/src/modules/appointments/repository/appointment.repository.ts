import { AppointmentStatus, AppointmentTargetType, Prisma, UserRole } from "@prisma/client";

import { prisma } from "../../../config/database";
import {
  AppointmentListQuery,
  AppointmentTarget,
  CreateAppointmentInput,
  RescheduleAppointmentInput
} from "../types/appointment.types";

const activeStatuses = [
  AppointmentStatus.PENDING,
  AppointmentStatus.APPROVED,
  AppointmentStatus.RESCHEDULED
];

const userSummarySelect = {
  id: true,
  email: true,
  firstName: true,
  middleName: true,
  lastName: true,
  role: true
} as const;

const appointmentInclude = {
  student: {
    include: {
      user: { select: userSummarySelect },
      department: { select: { id: true, name: true } }
    }
  },
  office: true,
  department: true,
  faculty: {
    include: {
      user: { select: userSummarySelect },
      department: { select: { id: true, name: true } }
    }
  },
  reschedules: {
    include: {
      requestedBy: { select: userSummarySelect }
    },
    orderBy: { createdAt: "asc" as const }
  }
} as const;

export const appointmentRepository = {
  findStudentByUserId(userId: string) {
    return prisma.studentProfile.findUnique({
      where: { userId },
      select: { id: true, userId: true }
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
    return prisma.office.findUnique({
      where: { id },
      select: { id: true, name: true }
    });
  },

  findDepartmentById(id: string) {
    return prisma.department.findUnique({
      where: { id },
      select: { id: true, name: true }
    });
  },

  findFacultyById(id: string) {
    return prisma.facultyProfile.findUnique({
      where: { id },
      select: {
        id: true,
        departmentId: true,
        user: { select: { isActive: true } }
      }
    });
  },

  async create(input: CreateAppointmentInput, studentId: string) {
    return prisma.$transaction(async (tx) => {
      const conflict = await findConflict(
        tx,
        studentId,
        input,
        new Date(input.startTime),
        new Date(input.endTime)
      );
      if (conflict) return null;

      return tx.appointment.create({
        data: {
          title: input.title,
          description: input.description,
          studentId,
          targetType: input.targetType,
          officeId: input.officeId,
          departmentId: input.departmentId,
          facultyId: input.facultyId,
          startTime: new Date(input.startTime),
          endTime: new Date(input.endTime)
        },
        include: appointmentInclude
      });
    });
  },

  detectConflict(
    studentId: string,
    target: AppointmentTarget,
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ) {
    return findConflict(prisma, studentId, target, startTime, endTime, excludeId);
  },

  findAll(where: Prisma.AppointmentWhereInput, skip: number, take: number) {
    return prisma.appointment.findMany({
      where,
      skip,
      take,
      include: appointmentInclude,
      orderBy: [{ startTime: "asc" }, { createdAt: "desc" }]
    });
  },

  count(where: Prisma.AppointmentWhereInput) {
    return prisma.appointment.count({ where });
  },

  findById(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
      include: appointmentInclude
    });
  },

  findAccessRecord(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        studentId: true,
        targetType: true,
        officeId: true,
        departmentId: true,
        facultyId: true,
        startTime: true,
        endTime: true,
        status: true,
        student: { select: { userId: true } },
        faculty: { select: { departmentId: true, userId: true } }
      }
    });
  },

  findReservedTimes(target: AppointmentTarget, startTime: Date, endTime: Date) {
    return prisma.appointment.findMany({
      where: {
        status: { in: activeStatuses },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
        ...(target.targetType === AppointmentTargetType.OFFICE
          ? { officeId: target.officeId }
          : {}),
        ...(target.targetType === AppointmentTargetType.DEPARTMENT
          ? { departmentId: target.departmentId }
          : {}),
        ...(target.targetType === AppointmentTargetType.PROFESSOR
          ? { facultyId: target.facultyId }
          : {})
      },
      select: {
        startTime: true,
        endTime: true,
        status: true
      },
      orderBy: { startTime: "asc" }
    });
  },

  updateStatus(
    id: string,
    status: AppointmentStatus,
    data: {
      rejectionReason?: string | null;
      cancelledAt?: Date | null;
      completedAt?: Date | null;
    } = {}
  ) {
    return prisma.appointment.update({
      where: { id },
      data: {
        status,
        ...data
      },
      include: appointmentInclude
    });
  },

  async reschedule(
    id: string,
    studentId: string,
    actorId: string,
    input: RescheduleAppointmentInput,
    target: AppointmentTarget
  ) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.appointment.findUniqueOrThrow({
        where: { id },
        select: { startTime: true, endTime: true }
      });
      const conflict = await findConflict(
        tx,
        studentId,
        target,
        new Date(input.newStartTime),
        new Date(input.newEndTime),
        id
      );
      if (conflict) return null;

      await tx.appointmentReschedule.create({
        data: {
          appointmentId: id,
          oldStartTime: current.startTime,
          oldEndTime: current.endTime,
          newStartTime: new Date(input.newStartTime),
          newEndTime: new Date(input.newEndTime),
          reason: input.reason,
          requestedById: actorId
        }
      });

      return tx.appointment.update({
        where: { id },
        data: {
          startTime: new Date(input.newStartTime),
          endTime: new Date(input.newEndTime),
          status: AppointmentStatus.RESCHEDULED,
          rejectionReason: null,
          cancelledAt: null,
          completedAt: null
        },
        include: appointmentInclude
      });
    });
  },

  buildWhere(
    actor: { id: string; role: UserRole },
    query: AppointmentListQuery,
    scope?: { studentId?: string; officeId?: string; departmentId?: string; facultyId?: string }
  ): Prisma.AppointmentWhereInput {
    const and: Prisma.AppointmentWhereInput[] = [];

    if (actor.role === UserRole.STUDENT) {
      and.push({ studentId: scope?.studentId });
    } else if (actor.role === UserRole.OFFICE_STAFF) {
      and.push({ officeId: scope?.officeId });
    } else if (actor.role === UserRole.PROFESSOR) {
      and.push({ facultyId: scope?.facultyId });
    } else if (actor.role === UserRole.DEAN || actor.role === UserRole.CHAIR) {
      and.push({
        OR: [
          { departmentId: scope?.departmentId },
          { faculty: { departmentId: scope?.departmentId } }
        ]
      });
    }

    if (query.status) and.push({ status: query.status });
    if (query.studentId) and.push({ studentId: query.studentId });
    if (query.officeId) and.push({ officeId: query.officeId });
    if (query.departmentId) and.push({ departmentId: query.departmentId });
    if (query.facultyId) and.push({ facultyId: query.facultyId });
    if (query.startFrom) and.push({ startTime: { gte: new Date(query.startFrom) } });
    if (query.startTo) and.push({ startTime: { lte: new Date(query.startTo) } });
    if (query.search) {
      and.push({
        OR: [
          { title: { contains: query.search, mode: "insensitive" } },
          { description: { contains: query.search, mode: "insensitive" } },
          { office: { name: { contains: query.search, mode: "insensitive" } } },
          { department: { name: { contains: query.search, mode: "insensitive" } } },
          { faculty: { user: { firstName: { contains: query.search, mode: "insensitive" } } } },
          { faculty: { user: { lastName: { contains: query.search, mode: "insensitive" } } } }
        ]
      });
    }

    return and.length > 0 ? { AND: and } : {};
  }
};

async function findConflict(
  tx: Prisma.TransactionClient,
  studentId: string,
  target: AppointmentTarget,
  startTime: Date,
  endTime: Date,
  excludeId?: string
) {
  return tx.appointment.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      status: { in: activeStatuses },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
      OR: [
        { studentId },
        ...(target.targetType === AppointmentTargetType.OFFICE
          ? [{ officeId: target.officeId }]
          : []),
        ...(target.targetType === AppointmentTargetType.DEPARTMENT
          ? [{ departmentId: target.departmentId }]
          : []),
        ...(target.targetType === AppointmentTargetType.PROFESSOR
          ? [{ facultyId: target.facultyId }]
          : [])
      ]
    },
    select: { id: true }
  });
}

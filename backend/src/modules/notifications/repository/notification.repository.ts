import { FacultyPosition, Prisma } from "@prisma/client";

import { prisma } from "../../../config/database";
import {
  CreateNotificationInput,
  NotificationListQuery,
  NotificationTarget
} from "../types/notification.types";

export const notificationRepository = {
  findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true }
    });
  },

  create(input: CreateNotificationInput) {
    return prisma.notification.create({
      data: input
    });
  },

  createMany(inputs: CreateNotificationInput[]) {
    return prisma.notification.createMany({
      data: inputs,
      skipDuplicates: true
    });
  },

  findActiveUserIds(userIds: string[]) {
    return prisma.user.findMany({
      where: {
        id: { in: userIds },
        isActive: true
      },
      select: { id: true }
    });
  },

  findAllForUser(userId: string, query: NotificationListQuery, skip: number, take: number) {
    return prisma.notification.findMany({
      where: buildNotificationWhere(userId, query),
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        title: true,
        message: true,
        isRead: true,
        createdAt: true
      }
    });
  },

  countForUser(userId: string, query: NotificationListQuery) {
    return prisma.notification.count({
      where: buildNotificationWhere(userId, query)
    });
  },

  countUnreadForUser(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false }
    });
  },

  findById(id: string) {
    return prisma.notification.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        title: true,
        message: true,
        isRead: true,
        createdAt: true
      }
    });
  },

  markReadState(id: string, isRead: boolean) {
    return prisma.notification.update({
      where: { id },
      data: { isRead }
    });
  },

  markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: { isRead: true }
    });
  },

  delete(id: string) {
    return prisma.notification.delete({
      where: { id }
    });
  },

  async findTargetHandlerUserIds(target: NotificationTarget): Promise<string[]> {
    if (target.targetType === "OFFICE") {
      if (!target.officeId) return [];
      const staff = await prisma.officeStaffProfile.findMany({
        where: {
          officeId: target.officeId,
          user: { isActive: true }
        },
        select: { userId: true }
      });
      return staff.map((profile) => profile.userId);
    }

    if (target.targetType === "DEPARTMENT") {
      if (!target.departmentId) return [];
      const faculty = await prisma.facultyProfile.findMany({
        where: {
          departmentId: target.departmentId,
          position: { in: [FacultyPosition.DEAN, FacultyPosition.CHAIR] },
          user: { isActive: true }
        },
        select: { userId: true }
      });
      return faculty.map((profile) => profile.userId);
    }

    if (!target.facultyId) return [];
    const faculty = await prisma.facultyProfile.findUnique({
      where: { id: target.facultyId },
      select: {
        userId: true,
        user: { select: { isActive: true } }
      }
    });
    return faculty?.user.isActive ? [faculty.userId] : [];
  }
};

function buildNotificationWhere(
  userId: string,
  query: NotificationListQuery
): Prisma.NotificationWhereInput {
  return {
    userId,
    isRead: query.isRead,
    createdAt:
      query.startDate || query.endDate
        ? {
            gte: query.startDate ? new Date(query.startDate) : undefined,
            lte: query.endDate ? new Date(query.endDate) : undefined
          }
        : undefined
  };
}

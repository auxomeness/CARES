import { Prisma } from "@prisma/client";

import { prisma } from "../../../config/database";

export const userRepository = {
  findProfileById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        middleName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        studentProfile: {
          include: {
            department: true
          }
        },
        facultyProfile: {
          include: {
            department: true
          }
        },
        officeStaffProfile: {
          include: {
            office: true
          }
        }
      }
    });
  },

  async updateCurrentUser(
    id: string,
    input: {
      email?: string;
      firstName?: string;
      middleName?: string | null;
      lastName?: string;
      course?: string;
      yearLevel?: number;
    }
  ) {
    await prisma.$transaction(async (tx) => {
      const userData: Prisma.UserUpdateInput = {};
      if (input.email !== undefined) userData.email = input.email;
      if (input.firstName !== undefined) userData.firstName = input.firstName;
      if (input.middleName !== undefined) userData.middleName = input.middleName;
      if (input.lastName !== undefined) userData.lastName = input.lastName;

      if (Object.keys(userData).length > 0) {
        await tx.user.update({ where: { id }, data: userData });
      }

      if (input.course !== undefined || input.yearLevel !== undefined) {
        await tx.studentProfile.update({
          where: { userId: id },
          data: {
            course: input.course,
            yearLevel: input.yearLevel
          }
        });
      }
    });

    return this.findProfileById(id);
  }
};

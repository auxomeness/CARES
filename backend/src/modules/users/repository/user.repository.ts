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
        }
      }
    });
  }
};

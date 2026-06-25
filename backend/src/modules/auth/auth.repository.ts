import { prisma } from "../../config/database";

const safeUserSelect = {
  id: true,
  email: true,
  firstName: true,
  middleName: true,
  lastName: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
} as const;

export const authRepository = {
  listRegistrationDepartments() {
    return prisma.department.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    });
  },
  findUserForLogin(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        ...safeUserSelect,
        password: true
      }
    });
  },

  findSafeUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: safeUserSelect
    });
  }
};

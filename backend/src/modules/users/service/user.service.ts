import { ForbiddenError, NotFoundError } from "../../../shared/errors";
import { AuthenticatedUser } from "../../../shared/types/auth.types";
import { userRepository } from "../repository/user.repository";

export const userService = {
  async getCurrentUserProfile(actor: AuthenticatedUser) {
    const user = await userRepository.findProfileById(actor.id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.isActive) {
      throw new ForbiddenError("User account is inactive");
    }

    return {
      id: user.id,
      name: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" "),
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      studentProfile: user.studentProfile,
      facultyProfile: user.facultyProfile,
      officeStaffProfile: user.officeStaffProfile,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
};

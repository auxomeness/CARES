import { ForbiddenError, NotFoundError, UnauthorizedError } from "../../shared/errors";
import { AuthenticatedUser } from "../../shared/types/auth.types";
import { authRepository } from "./auth.repository";
import { LoginInput, LoginResult, SafeUserProfile } from "./auth.types";
import { comparePassword, generateAccessToken } from "./auth.utils";

export const authService = {
  async login(input: LoginInput): Promise<LoginResult> {
    const user = await authRepository.findUserForLogin(input.email);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.isActive) {
      throw new ForbiddenError("User account is inactive");
    }

    const isPasswordValid = await comparePassword(input.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const safeUser = sanitizeUser(user);
    const accessToken = generateAccessToken(safeUser);

    return {
      accessToken,
      user: safeUser
    };
  },

  async getCurrentUser(authenticatedUser: AuthenticatedUser): Promise<SafeUserProfile> {
    const user = await authRepository.findSafeUserById(authenticatedUser.id);

    if (!user) {
      throw new UnauthorizedError("Authenticated user no longer exists");
    }

    if (!user.isActive) {
      throw new ForbiddenError("User account is inactive");
    }

    return user;
  }
};

function sanitizeUser(user: SafeUserProfile & { password?: string }): SafeUserProfile {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

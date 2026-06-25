import { ForbiddenError, UnauthorizedError } from "../../shared/errors";
import { AuthenticatedUser } from "../../shared/types/auth.types";
import { logger } from "../../shared/utils/logger";
import { authRepository } from "./auth.repository";
import { LoginInput, LoginResult, RegisterStudentInput, SafeUserProfile } from "./auth.types";
import { comparePassword, generateAccessToken } from "./auth.utils";
import { studentService } from "../students/service/student.service";

export const authService = {
  async registerStudent(input: RegisterStudentInput): Promise<LoginResult> {
    await studentService.createStudent(input);
    logger.info({ outcome: "student_registered" }, "Student account registered");
    return this.login({ email: input.email, password: input.password });
  },

  listRegistrationDepartments() {
    return authRepository.listRegistrationDepartments();
  },

  async login(input: LoginInput): Promise<LoginResult> {
    const user = await authRepository.findUserForLogin(input.email);
    const isPasswordValid = await comparePassword(
      input.password,
      user?.password ?? DUMMY_PASSWORD_HASH
    );

    if (!user || !isPasswordValid) {
      logger.warn({ outcome: "invalid_credentials" }, "Authentication attempt rejected");
      throw new UnauthorizedError("Invalid credentials");
    }

    if (!user.isActive) {
      logger.warn(
        { userId: user.id, outcome: "inactive_account" },
        "Authentication attempt rejected"
      );
      throw new ForbiddenError("User account is inactive");
    }

    const safeUser = sanitizeUser(user);
    const accessToken = generateAccessToken(safeUser);
    logger.info(
      { userId: user.id, role: user.role, outcome: "success" },
      "Authentication succeeded"
    );

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

const DUMMY_PASSWORD_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.5GdrX9eVJRTy1sXQ8dP1QZ1h1w7w3Ce";

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

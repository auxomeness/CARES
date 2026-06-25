import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUserForLogin: vi.fn(),
  comparePassword: vi.fn(),
  generateAccessToken: vi.fn()
}));

vi.mock("../../src/modules/auth/auth.repository", () => ({
  authRepository: {
    findUserForLogin: mocks.findUserForLogin
  }
}));
vi.mock("../../src/modules/auth/auth.utils", () => ({
  comparePassword: mocks.comparePassword,
  generateAccessToken: mocks.generateAccessToken
}));
vi.mock("../../src/shared/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn()
  }
}));

import { authService } from "../../src/modules/auth/auth.service";

const user = {
  id: "cm00000000000000000000001",
  email: "student@adnu.edu.ph",
  password: "hash",
  firstName: "Test",
  middleName: null,
  lastName: "Student",
  role: UserRole.STUDENT,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

describe("authService", () => {
  beforeEach(() => {
    mocks.findUserForLogin.mockReset();
    mocks.comparePassword.mockReset();
    mocks.generateAccessToken.mockReset();
  });

  it("returns a token and never exposes the password", async () => {
    mocks.findUserForLogin.mockResolvedValue(user);
    mocks.comparePassword.mockResolvedValue(true);
    mocks.generateAccessToken.mockReturnValue("token");

    const result = await authService.login({
      email: user.email,
      password: "password123"
    });

    expect(result.accessToken).toBe("token");
    expect(result.user).not.toHaveProperty("password");
  });

  it("uses the same unauthorized response for missing users and bad passwords", async () => {
    mocks.findUserForLogin.mockResolvedValue(null);
    mocks.comparePassword.mockResolvedValue(false);

    await expect(
      authService.login({ email: "missing@adnu.edu.ph", password: "password123" })
    ).rejects.toMatchObject({ statusCode: 401, message: "Invalid credentials" });
  });
});

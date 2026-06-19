import bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

import { env } from "../../config/env";
import { ROLE_VALUES, Role } from "../../shared/constants/role.constants";
import { UnauthorizedError } from "../../shared/errors";
import { JwtPayload } from "../../shared/types/auth.types";
import { SafeUserProfile } from "./auth.types";

const SALT_ROUNDS = 12;

function isRole(value: unknown): value is Role {
  return typeof value === "string" && ROLE_VALUES.includes(value as Role);
}

function isJwtPayload(value: unknown): value is JwtPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.userId === "string" &&
    typeof candidate.email === "string" &&
    isRole(candidate.role)
  );
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function generateAccessToken(user: Pick<SafeUserProfile, "id" | "email" | "role">): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  };

  return jwt.sign(payload, env.JWT_SECRET as Secret, options);
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET as Secret);

  if (!isJwtPayload(decoded)) {
    throw new UnauthorizedError("Invalid token payload");
  }

  return decoded;
}

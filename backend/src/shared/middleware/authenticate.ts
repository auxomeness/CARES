import { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";

import { UnauthorizedError } from "../errors";
import { authRepository } from "../../modules/auth/auth.repository";
import { verifyToken } from "../../modules/auth/auth.utils";

type AuthCacheEntry = {
  user: {
    id: string;
    role: UserRole;
    isActive: boolean;
  };
  expiresAt: number;
};

const AUTH_CACHE_TTL_MS = process.env.NODE_ENV === "test" ? 0 : 30_000;
const authCache = new Map<string, AuthCacheEntry>();

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    next(new UnauthorizedError("Missing bearer token"));
    return;
  }

  const token = authorizationHeader.slice("Bearer ".length);

  try {
    const decoded = verifyToken(token);
    const cached = getCachedUser(token);
    const user = cached ?? (await authRepository.findSafeUserById(decoded.userId));

    if (!user || !user.isActive || user.role !== decoded.role) {
      next(new UnauthorizedError("Authentication session is no longer valid"));
      return;
    }

    cacheUser(token, user);
    req.user = {
      id: user.id,
      role: user.role
    };
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}

function getCachedUser(token: string): AuthCacheEntry["user"] | null {
  if (AUTH_CACHE_TTL_MS <= 0) return null;

  const cached = authCache.get(token);
  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    authCache.delete(token);
    return null;
  }

  return cached.user;
}

function cacheUser(token: string, user: AuthCacheEntry["user"]): void {
  if (AUTH_CACHE_TTL_MS <= 0) return;

  authCache.set(token, {
    user: {
      id: user.id,
      role: user.role,
      isActive: user.isActive
    },
    expiresAt: Date.now() + AUTH_CACHE_TTL_MS
  });
}

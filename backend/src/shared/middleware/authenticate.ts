import { NextFunction, Request, Response } from "express";

import { UnauthorizedError } from "../errors";
import { authRepository } from "../../modules/auth/auth.repository";
import { verifyToken } from "../../modules/auth/auth.utils";

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
    const user = await authRepository.findSafeUserById(decoded.userId);

    if (!user || !user.isActive || user.role !== decoded.role) {
      next(new UnauthorizedError("Authentication session is no longer valid"));
      return;
    }

    req.user = {
      id: user.id,
      role: user.role
    };
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}

import { NextFunction, Request, Response } from "express";

import { UnauthorizedError } from "../errors";
import { verifyToken } from "../../modules/auth/auth.utils";

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    next(new UnauthorizedError("Missing bearer token"));
    return;
  }

  const token = authorizationHeader.slice("Bearer ".length);

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}

import { UserRole } from "@prisma/client";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: UserRole;
};

export type JwtPayload = {
  userId: string;
  email: string;
  role: UserRole;
};

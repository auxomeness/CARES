import { UserRole } from "@prisma/client";

export type AuthenticatedUser = {
  id: string;
  role: UserRole;
};

export type JwtPayload = {
  userId: string;
  role: UserRole;
};

import { UserRole } from "@prisma/client";

export const ROLES = UserRole;

export type Role = UserRole;

export const ROLE_VALUES = Object.values(ROLES);

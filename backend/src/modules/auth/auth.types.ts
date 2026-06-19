import { UserRole } from "@prisma/client";

export type LoginInput = {
  email: string;
  password: string;
};

export type SafeUserProfile = {
  id: string;
  email: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type LoginResult = {
  accessToken: string;
  user: SafeUserProfile;
};

export type UserRole = "user" | "reviewer" | "admin";

export interface PublicUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface UserRecord extends PublicUser {
  passwordHash: string;
}

export interface AuthTokenPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequestUser {
  userId: number;
  email: string;
  role: UserRole;
}

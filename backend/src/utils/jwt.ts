import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

import { env } from "../config/env";
import type { AuthTokenPayload } from "../types/auth.types";

export const signAccessToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtAccessTokenExpiresIn as SignOptions["expiresIn"]
  });
};

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  const decoded = jwt.verify(token, env.jwtSecret);

  if (!decoded || typeof decoded === "string") {
    throw new Error("Invalid token payload.");
  }

  const payload = decoded as Partial<AuthTokenPayload>;
  if (
    typeof payload.userId !== "number" ||
    typeof payload.email !== "string" ||
    !["user", "reviewer", "admin"].includes(String(payload.role))
  ) {
    throw new Error("Invalid token payload.");
  }

  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role as AuthTokenPayload["role"]
  };
};

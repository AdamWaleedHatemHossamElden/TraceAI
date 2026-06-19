import { ApiError } from "../errors/api-error";
import {
  createUser,
  findPublicUserById,
  findUserByEmail
} from "../repositories/user.repository";
import type { PublicUser } from "../types/auth.types";
import { signAccessToken } from "../utils/jwt";
import { hashPassword, verifyPassword } from "../utils/password";

const TOKEN_EXPIRES_IN = "1h";

const buildAuthResponse = (user: PublicUser) => ({
  user,
  accessToken: signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role
  }),
  expiresIn: TOKEN_EXPIRES_IN
});

export const registerUser = async (input: { fullName: string; email: string; password: string }) => {
  const existingUser = await findUserByEmail(input.email);
  if (existingUser) {
    throw new ApiError(409, "EMAIL_ALREADY_EXISTS", "An account with this email already exists.");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    fullName: input.fullName,
    email: input.email,
    passwordHash,
    role: "user"
  });

  return buildAuthResponse(user);
};

export const loginUser = async (input: { email: string; password: string }) => {
  const user = await findUserByEmail(input.email);
  if (!user) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  }

  const passwordMatches = await verifyPassword(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  }

  return buildAuthResponse({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role
  });
};

export const getCurrentUser = async (userId: number): Promise<PublicUser> => {
  const user = await findPublicUserById(userId);
  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication is required.");
  }

  return user;
};

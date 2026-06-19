import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../errors/api-error";
import type { AuthenticatedRequestUser, UserRole } from "../types/auth.types";
import { verifyAccessToken } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedRequestUser;
}

export const authenticate = (request: AuthenticatedRequest, _response: Response, next: NextFunction) => {
  const authorization = request.header("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    next(new ApiError(401, "UNAUTHORIZED", "Authentication is required."));
    return;
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    next(new ApiError(401, "UNAUTHORIZED", "Authentication is required."));
    return;
  }

  try {
    request.user = verifyAccessToken(token);
    next();
  } catch {
    next(new ApiError(401, "UNAUTHORIZED", "Authentication is required."));
  }
};

export const authorizeRoles = (allowedRoles: UserRole[]) => {
  return (request: AuthenticatedRequest, _response: Response, next: NextFunction) => {
    if (!request.user) {
      next(new ApiError(401, "UNAUTHORIZED", "Authentication is required."));
      return;
    }

    if (!allowedRoles.includes(request.user.role)) {
      next(new ApiError(403, "FORBIDDEN", "You do not have permission to access this resource."));
      return;
    }

    next();
  };
};

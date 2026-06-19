import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { getCurrentUser, loginUser, registerUser } from "../services/auth.service";
import { validateLoginRequest, validateRegisterRequest } from "../validation/auth.validation";

export const register = async (request: Request, response: Response) => {
  const input = validateRegisterRequest(request.body);
  const result = await registerUser(input);

  response.status(201).json(result);
};

export const login = async (request: Request, response: Response) => {
  const input = validateLoginRequest(request.body);
  const result = await loginUser(input);

  response.status(200).json(result);
};

export const me = async (request: AuthenticatedRequest, response: Response) => {
  const user = await getCurrentUser(request.user!.userId);

  response.status(200).json({ user });
};

import { Router } from "express";

import { login, me, register } from "../controllers/auth.controller";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(register));
authRouter.post("/login", asyncHandler(login));
authRouter.get("/me", authenticate, asyncHandler((request, response) => me(request as AuthenticatedRequest, response)));

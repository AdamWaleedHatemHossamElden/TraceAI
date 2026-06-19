import { Router } from "express";

import { getAiServiceHealth, getDatabaseHealth, getHealth } from "../controllers/health.controller";

export const healthRouter = Router();

healthRouter.get("/", getHealth);
healthRouter.get("/database", getDatabaseHealth);
healthRouter.get("/ai-service", getAiServiceHealth);

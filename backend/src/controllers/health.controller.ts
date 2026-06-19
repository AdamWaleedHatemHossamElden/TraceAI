import type { Request, Response } from "express";

import { databasePool } from "../config/database";
import { env } from "../config/env";

export const getHealth = (_request: Request, response: Response) => {
  response.status(200).json({
    status: "ok",
    service: "traceai-backend",
    timestamp: new Date().toISOString()
  });
};

export const getDatabaseHealth = async (_request: Request, response: Response) => {
  try {
    await databasePool.query("SELECT 1");

    response.status(200).json({
      status: "ok",
      service: "traceai-database"
    });
  } catch {
    response.status(503).json({
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "Database health check failed.",
        details: []
      }
    });
  }
};

export const getAiServiceHealth = async (_request: Request, response: Response) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const healthUrl = new URL("/health", env.aiServiceUrl);
    const aiResponse = await fetch(healthUrl, { signal: controller.signal });

    if (!aiResponse.ok) {
      throw new Error("AI service health check failed.");
    }

    response.status(200).json({
      status: "ok",
      service: "traceai-ai-service"
    });
  } catch {
    response.status(503).json({
      error: {
        code: "AI_SERVICE_UNAVAILABLE",
        message: "AI service health check failed.",
        details: []
      }
    });
  } finally {
    clearTimeout(timeout);
  }
};

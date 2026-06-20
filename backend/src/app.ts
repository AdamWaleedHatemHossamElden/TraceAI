import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env";
import { errorMiddleware } from "./middleware/error.middleware";
import { authRouter } from "./routes/auth.routes";
import { healthRouter } from "./routes/health.routes";
import { projectRouter } from "./routes/project.routes";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.use(`${env.apiPrefix}/auth`, authRouter);
  app.use(`${env.apiPrefix}/health`, healthRouter);
  app.use(`${env.apiPrefix}/projects`, projectRouter);

  app.use(errorMiddleware);

  return app;
};

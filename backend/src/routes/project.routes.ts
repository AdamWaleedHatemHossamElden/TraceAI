import { Router } from "express";

import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject
} from "../controllers/project.controller";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const projectRouter = Router();

projectRouter.use(authenticate);

projectRouter.post(
  "/",
  asyncHandler((request, response) => createProject(request as AuthenticatedRequest, response))
);
projectRouter.get(
  "/",
  asyncHandler((request, response) => listProjects(request as AuthenticatedRequest, response))
);
projectRouter.get(
  "/:projectId",
  asyncHandler((request, response) => getProject(request as AuthenticatedRequest, response))
);
projectRouter.patch(
  "/:projectId",
  asyncHandler((request, response) => updateProject(request as AuthenticatedRequest, response))
);
projectRouter.delete(
  "/:projectId",
  asyncHandler((request, response) => deleteProject(request as AuthenticatedRequest, response))
);

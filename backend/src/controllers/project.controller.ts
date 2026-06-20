import type { Response } from "express";

import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  createUserProject,
  deleteUserProject,
  getUserProject,
  listUserProjects,
  updateUserProject
} from "../services/project.service";
import {
  validateCreateProjectRequest,
  validateProjectId,
  validateUpdateProjectRequest
} from "../validation/project.validation";

export const createProject = async (request: AuthenticatedRequest, response: Response) => {
  const input = validateCreateProjectRequest(request.body);
  const project = await createUserProject({
    ownerUserId: request.user!.userId,
    ...input
  });

  response.status(201).json({ project });
};

export const listProjects = async (request: AuthenticatedRequest, response: Response) => {
  const projects = await listUserProjects(request.user!.userId);

  response.status(200).json({ projects });
};

export const getProject = async (request: AuthenticatedRequest, response: Response) => {
  const projectId = validateProjectId(request.params.projectId);
  const project = await getUserProject(projectId, request.user!.userId);

  response.status(200).json({ project });
};

export const updateProject = async (request: AuthenticatedRequest, response: Response) => {
  const projectId = validateProjectId(request.params.projectId);
  const input = validateUpdateProjectRequest(request.body);
  const project = await updateUserProject(projectId, request.user!.userId, input);

  response.status(200).json({ project });
};

export const deleteProject = async (request: AuthenticatedRequest, response: Response) => {
  const projectId = validateProjectId(request.params.projectId);
  await deleteUserProject(projectId, request.user!.userId);

  response.status(204).send();
};

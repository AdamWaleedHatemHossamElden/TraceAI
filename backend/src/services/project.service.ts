import { ApiError } from "../errors/api-error";
import {
  createProject,
  deleteProjectForOwner,
  findProjectByIdForOwner,
  listProjectsForOwner,
  toPublicProject,
  updateProjectForOwner
} from "../repositories/project.repository";
import type { CreateProjectInput, PublicProject, UpdateProjectInput } from "../types/project.types";

const notFoundError = () => new ApiError(404, "PROJECT_NOT_FOUND", "Project was not found.");

export const createUserProject = async (input: CreateProjectInput): Promise<PublicProject> => {
  const project = await createProject(input);
  return toPublicProject(project);
};

export const listUserProjects = async (ownerUserId: number): Promise<PublicProject[]> => {
  const projects = await listProjectsForOwner(ownerUserId);
  return projects.map(toPublicProject);
};

export const getUserProject = async (
  projectId: number,
  ownerUserId: number
): Promise<PublicProject> => {
  const project = await findProjectByIdForOwner(projectId, ownerUserId);
  if (!project) {
    throw notFoundError();
  }

  return toPublicProject(project);
};

export const updateUserProject = async (
  projectId: number,
  ownerUserId: number,
  input: UpdateProjectInput
): Promise<PublicProject> => {
  const project = await updateProjectForOwner(projectId, ownerUserId, input);
  if (!project) {
    throw notFoundError();
  }

  return toPublicProject(project);
};

export const deleteUserProject = async (projectId: number, ownerUserId: number): Promise<void> => {
  const deleted = await deleteProjectForOwner(projectId, ownerUserId);
  if (!deleted) {
    throw notFoundError();
  }
};

import client from './client';
import type {
  Project,
  ProjectResponse,
  ProjectsResponse,
  CreateProjectInput,
  UpdateProjectInput,
} from '../types/api';

export type { Project };

export async function getProjects(): Promise<Project[]> {
  const res = await client.get<ProjectsResponse>('/projects');
  return res.data.projects;
}

export async function getProject(projectId: number): Promise<Project> {
  const res = await client.get<ProjectResponse>(`/projects/${projectId}`);
  return res.data.project;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const res = await client.post<ProjectResponse>('/projects', input);
  return res.data.project;
}

export async function updateProject(
  projectId: number,
  input: UpdateProjectInput
): Promise<Project> {
  const res = await client.patch<ProjectResponse>(`/projects/${projectId}`, input);
  return res.data.project;
}

export async function deleteProject(projectId: number): Promise<void> {
  await client.delete(`/projects/${projectId}`);
}

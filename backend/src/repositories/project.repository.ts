import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { databasePool } from "../config/database";
import type {
  CreateProjectInput,
  Project,
  PublicProject,
  UpdateProjectInput
} from "../types/project.types";

interface ProjectRow extends RowDataPacket {
  id: number;
  owner_user_id: number;
  name: string;
  description: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

const toIsoString = (value: Date | string): string => {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
};

const toProject = (row: ProjectRow): Project => ({
  id: row.id,
  ownerUserId: row.owner_user_id,
  name: row.name,
  description: row.description,
  createdAt: toIsoString(row.created_at),
  updatedAt: toIsoString(row.updated_at)
});

export const toPublicProject = (project: Project): PublicProject => ({
  id: project.id,
  name: project.name,
  description: project.description,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt
});

export const createProject = async (input: CreateProjectInput): Promise<Project> => {
  const [result] = await databasePool.query<ResultSetHeader>(
    "INSERT INTO projects (owner_user_id, name, description) VALUES (?, ?, ?)",
    [input.ownerUserId, input.name, input.description]
  );

  const project = await findProjectByIdForOwner(result.insertId, input.ownerUserId);
  if (!project) {
    throw new Error("Created project could not be loaded.");
  }

  return project;
};

export const listProjectsForOwner = async (ownerUserId: number): Promise<Project[]> => {
  const [rows] = await databasePool.query<ProjectRow[]>(
    "SELECT id, owner_user_id, name, description, created_at, updated_at FROM projects WHERE owner_user_id = ? ORDER BY updated_at DESC",
    [ownerUserId]
  );

  return rows.map(toProject);
};

export const findProjectByIdForOwner = async (
  projectId: number,
  ownerUserId: number
): Promise<Project | null> => {
  const [rows] = await databasePool.query<ProjectRow[]>(
    "SELECT id, owner_user_id, name, description, created_at, updated_at FROM projects WHERE id = ? AND owner_user_id = ? LIMIT 1",
    [projectId, ownerUserId]
  );

  return rows[0] ? toProject(rows[0]) : null;
};

export const updateProjectForOwner = async (
  projectId: number,
  ownerUserId: number,
  input: UpdateProjectInput
): Promise<Project | null> => {
  const updates: string[] = [];
  const values: Array<string | null | number> = [];

  if (Object.prototype.hasOwnProperty.call(input, "name")) {
    updates.push("name = ?");
    values.push(input.name as string);
  }

  if (Object.prototype.hasOwnProperty.call(input, "description")) {
    updates.push("description = ?");
    values.push(input.description ?? null);
  }

  values.push(projectId, ownerUserId);

  const [result] = await databasePool.query<ResultSetHeader>(
    `UPDATE projects SET ${updates.join(", ")} WHERE id = ? AND owner_user_id = ?`,
    values
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return findProjectByIdForOwner(projectId, ownerUserId);
};

export const deleteProjectForOwner = async (
  projectId: number,
  ownerUserId: number
): Promise<boolean> => {
  const [result] = await databasePool.query<ResultSetHeader>(
    "DELETE FROM projects WHERE id = ? AND owner_user_id = ?",
    [projectId, ownerUserId]
  );

  return result.affectedRows > 0;
};

import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { databasePool } from "../config/database";
import type {
  Analysis,
  AnalysisListItem,
  AnalysisStatus,
  CreateAnalysisInput,
  UpdateAnalysisInput
} from "../types/analysis.types";

interface AnalysisRow extends RowDataPacket {
  id: number;
  project_id: number;
  project_name: string;
  prompt: string;
  ai_response: string;
  model_name: string | null;
  topic: string | null;
  status: AnalysisStatus;
  created_at: Date | string;
  updated_at: Date | string;
}

interface AnalysisListRow extends RowDataPacket {
  id: number;
  project_id: number;
  project_name: string;
  prompt: string;
  model_name: string | null;
  topic: string | null;
  status: AnalysisStatus;
  created_at: Date | string;
  updated_at: Date | string;
}

const toIsoString = (value: Date | string): string => {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
};

const toAnalysis = (row: AnalysisRow): Analysis => ({
  id: row.id,
  projectId: row.project_id,
  projectName: row.project_name,
  prompt: row.prompt,
  aiResponse: row.ai_response,
  modelName: row.model_name,
  topic: row.topic,
  status: row.status,
  createdAt: toIsoString(row.created_at),
  updatedAt: toIsoString(row.updated_at)
});

const toAnalysisListItem = (row: AnalysisListRow): AnalysisListItem => ({
  id: row.id,
  projectId: row.project_id,
  projectName: row.project_name,
  prompt: row.prompt,
  modelName: row.model_name,
  topic: row.topic,
  status: row.status,
  createdAt: toIsoString(row.created_at),
  updatedAt: toIsoString(row.updated_at)
});

export const createAnalysis = async (
  input: CreateAnalysisInput,
  ownerUserId: number
): Promise<Analysis> => {
  const [result] = await databasePool.query<ResultSetHeader>(
    "INSERT INTO analyses (project_id, prompt, ai_response, model_name, topic) VALUES (?, ?, ?, ?, ?)",
    [input.projectId, input.prompt, input.aiResponse, input.modelName, input.topic]
  );

  const analysis = await findAnalysisByIdForOwner(result.insertId, ownerUserId);
  if (!analysis) {
    throw new Error("Created analysis could not be loaded.");
  }

  return analysis;
};

export const listAnalysesForOwner = async (
  ownerUserId: number,
  projectId?: number
): Promise<AnalysisListItem[]> => {
  const values: number[] = [ownerUserId];
  let projectFilter = "";

  if (projectId !== undefined) {
    projectFilter = " AND analyses.project_id = ?";
    values.push(projectId);
  }

  const [rows] = await databasePool.query<AnalysisListRow[]>(
    `SELECT analyses.id, analyses.project_id, projects.name AS project_name, analyses.prompt,
      analyses.model_name, analyses.topic, analyses.status, analyses.created_at, analyses.updated_at
     FROM analyses
     INNER JOIN projects ON projects.id = analyses.project_id
     WHERE projects.owner_user_id = ?${projectFilter}
     ORDER BY analyses.updated_at DESC`,
    values
  );

  return rows.map(toAnalysisListItem);
};

export const findAnalysisByIdForOwner = async (
  analysisId: number,
  ownerUserId: number
): Promise<Analysis | null> => {
  const [rows] = await databasePool.query<AnalysisRow[]>(
    `SELECT analyses.id, analyses.project_id, projects.name AS project_name, analyses.prompt,
      analyses.ai_response, analyses.model_name, analyses.topic, analyses.status,
      analyses.created_at, analyses.updated_at
     FROM analyses
     INNER JOIN projects ON projects.id = analyses.project_id
     WHERE analyses.id = ? AND projects.owner_user_id = ?
     LIMIT 1`,
    [analysisId, ownerUserId]
  );

  return rows[0] ? toAnalysis(rows[0]) : null;
};

export const updateAnalysisForOwner = async (
  analysisId: number,
  ownerUserId: number,
  input: UpdateAnalysisInput
): Promise<Analysis | null> => {
  const updates: string[] = [];
  const values: Array<string | null | number> = [];

  if (Object.prototype.hasOwnProperty.call(input, "prompt")) {
    updates.push("analyses.prompt = ?");
    values.push(input.prompt as string);
  }

  if (Object.prototype.hasOwnProperty.call(input, "aiResponse")) {
    updates.push("analyses.ai_response = ?");
    values.push(input.aiResponse as string);
  }

  if (Object.prototype.hasOwnProperty.call(input, "modelName")) {
    updates.push("analyses.model_name = ?");
    values.push(input.modelName ?? null);
  }

  if (Object.prototype.hasOwnProperty.call(input, "topic")) {
    updates.push("analyses.topic = ?");
    values.push(input.topic ?? null);
  }

  values.push(analysisId, ownerUserId);

  await databasePool.query<ResultSetHeader>(
    `UPDATE analyses
     INNER JOIN projects ON projects.id = analyses.project_id
     SET ${updates.join(", ")}
     WHERE analyses.id = ? AND projects.owner_user_id = ?`,
    values
  );

  return findAnalysisByIdForOwner(analysisId, ownerUserId);
};

export const deleteAnalysisForOwner = async (
  analysisId: number,
  ownerUserId: number
): Promise<boolean> => {
  const [result] = await databasePool.query<ResultSetHeader>(
    `DELETE analyses
     FROM analyses
     INNER JOIN projects ON projects.id = analyses.project_id
     WHERE analyses.id = ? AND projects.owner_user_id = ?`,
    [analysisId, ownerUserId]
  );

  return result.affectedRows > 0;
};

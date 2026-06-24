import { ApiError } from "../errors/api-error";
import {
  createAnalysis,
  deleteAnalysisForOwner,
  findAnalysisByIdForOwner,
  listAnalysesForOwner,
  updateAnalysisForOwner
} from "../repositories/analysis.repository";
import { findProjectByIdForOwner } from "../repositories/project.repository";
import type {
  Analysis,
  AnalysisListItem,
  CreateAnalysisInput,
  UpdateAnalysisInput
} from "../types/analysis.types";

const projectNotFoundError = () => new ApiError(404, "PROJECT_NOT_FOUND", "Project was not found.");
const analysisNotFoundError = () => new ApiError(404, "ANALYSIS_NOT_FOUND", "Analysis was not found.");

export const createUserAnalysis = async (
  ownerUserId: number,
  input: CreateAnalysisInput
): Promise<Analysis> => {
  const project = await findProjectByIdForOwner(input.projectId, ownerUserId);
  if (!project) {
    throw projectNotFoundError();
  }

  return createAnalysis(input, ownerUserId);
};

export const listUserAnalyses = async (
  ownerUserId: number,
  projectId?: number
): Promise<AnalysisListItem[]> => {
  if (projectId !== undefined) {
    const project = await findProjectByIdForOwner(projectId, ownerUserId);
    if (!project) {
      throw projectNotFoundError();
    }
  }

  return listAnalysesForOwner(ownerUserId, projectId);
};

export const getUserAnalysis = async (
  analysisId: number,
  ownerUserId: number
): Promise<Analysis> => {
  const analysis = await findAnalysisByIdForOwner(analysisId, ownerUserId);
  if (!analysis) {
    throw analysisNotFoundError();
  }

  return analysis;
};

export const updateUserAnalysis = async (
  analysisId: number,
  ownerUserId: number,
  input: UpdateAnalysisInput
): Promise<Analysis> => {
  const analysis = await updateAnalysisForOwner(analysisId, ownerUserId, input);
  if (!analysis) {
    throw analysisNotFoundError();
  }

  return analysis;
};

export const deleteUserAnalysis = async (analysisId: number, ownerUserId: number): Promise<void> => {
  const deleted = await deleteAnalysisForOwner(analysisId, ownerUserId);
  if (!deleted) {
    throw analysisNotFoundError();
  }
};

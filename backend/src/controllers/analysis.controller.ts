import type { Response } from "express";

import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  createUserAnalysis,
  deleteUserAnalysis,
  getUserAnalysis,
  listUserAnalyses,
  updateUserAnalysis
} from "../services/analysis.service";
import {
  validateAnalysisId,
  validateCreateAnalysisRequest,
  validateListAnalysesQuery,
  validateUpdateAnalysisRequest
} from "../validation/analysis.validation";

export const createAnalysis = async (request: AuthenticatedRequest, response: Response) => {
  const input = validateCreateAnalysisRequest(request.body);
  const analysis = await createUserAnalysis(request.user!.userId, input);

  response.status(201).json({ analysis });
};

export const listAnalyses = async (request: AuthenticatedRequest, response: Response) => {
  const { projectId } = validateListAnalysesQuery(request.query.projectId);
  const analyses = await listUserAnalyses(request.user!.userId, projectId);

  response.status(200).json({ analyses });
};

export const getAnalysis = async (request: AuthenticatedRequest, response: Response) => {
  const analysisId = validateAnalysisId(request.params.analysisId);
  const analysis = await getUserAnalysis(analysisId, request.user!.userId);

  response.status(200).json({ analysis });
};

export const updateAnalysis = async (request: AuthenticatedRequest, response: Response) => {
  const analysisId = validateAnalysisId(request.params.analysisId);
  const input = validateUpdateAnalysisRequest(request.body);
  const analysis = await updateUserAnalysis(analysisId, request.user!.userId, input);

  response.status(200).json({ analysis });
};

export const deleteAnalysis = async (request: AuthenticatedRequest, response: Response) => {
  const analysisId = validateAnalysisId(request.params.analysisId);
  await deleteUserAnalysis(analysisId, request.user!.userId);

  response.status(204).send();
};

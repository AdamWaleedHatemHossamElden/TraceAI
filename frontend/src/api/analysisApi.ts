import client from './client';
import type {
  AnalysisSummary,
  AnalysisDetail,
  AnalysesResponse,
  AnalysisSummaryResponse,
  AnalysisDetailResponse,
  CreateAnalysisInput,
  UpdateAnalysisInput,
} from '../types/api';

export type { AnalysisSummary, AnalysisDetail };

export async function getAnalyses(projectId?: number): Promise<AnalysisSummary[]> {
  const params = projectId !== undefined ? { projectId } : undefined;
  const res = await client.get<AnalysesResponse>('/analyses', { params });
  return res.data.analyses;
}

export async function getAnalysis(analysisId: number): Promise<AnalysisDetail> {
  const res = await client.get<AnalysisDetailResponse>(`/analyses/${analysisId}`);
  return res.data.analysis;
}

export async function createAnalysis(input: CreateAnalysisInput): Promise<AnalysisSummary> {
  const res = await client.post<AnalysisSummaryResponse>('/analyses', input);
  return res.data.analysis;
}

export async function updateAnalysis(
  analysisId: number,
  input: UpdateAnalysisInput,
): Promise<AnalysisSummary> {
  const res = await client.patch<AnalysisSummaryResponse>(`/analyses/${analysisId}`, input);
  return res.data.analysis;
}

export async function deleteAnalysis(analysisId: number): Promise<void> {
  await client.delete(`/analyses/${analysisId}`);
}

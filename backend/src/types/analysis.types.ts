export type AnalysisStatus = "draft" | "queued" | "processing" | "completed" | "failed";

export interface Analysis {
  id: number;
  projectId: number;
  projectName: string;
  prompt: string;
  aiResponse: string;
  modelName: string | null;
  topic: string | null;
  status: AnalysisStatus;
  createdAt: string;
  updatedAt: string;
}

export type AnalysisListItem = Omit<Analysis, "aiResponse">;

export interface CreateAnalysisInput {
  projectId: number;
  prompt: string;
  aiResponse: string;
  modelName: string | null;
  topic: string | null;
}

export interface UpdateAnalysisInput {
  prompt?: string;
  aiResponse?: string;
  modelName?: string | null;
  topic?: string | null;
}

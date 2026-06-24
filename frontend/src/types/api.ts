// ─── Standard API error shape (from API_CONTRACT.md) ─────────────────────────

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details: ApiErrorDetail[];
}

export interface ApiErrorResponse {
  error: ApiErrorBody;
}

// ─── Auth shapes (from openapi.yaml PublicUser / AuthResponse) ────────────────

export type UserRole = 'user' | 'reviewer' | 'admin';

export interface PublicUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  expiresIn: string;
}

export interface CurrentUserResponse {
  user: PublicUser;
}

// ─── Project shapes ───────────────────────────────────────────────────────────

export interface Project {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectResponse {
  project: Project;
}

export interface ProjectsResponse {
  projects: Project[];
}

export interface CreateProjectInput {
  name: string;
  description?: string | null;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
}

// ─── Analysis shapes ──────────────────────────────────────────────────────────

export type AnalysisStatus = 'draft' | 'queued' | 'processing' | 'completed' | 'failed';

/** Returned by list and create/update endpoints — does NOT include aiResponse */
export interface AnalysisSummary {
  id: number;
  projectId: number;
  projectName: string;
  prompt: string;
  modelName: string | null;
  topic: string | null;
  status: AnalysisStatus;
  createdAt: string;
  updatedAt: string;
}

/** Returned by the single-analysis GET endpoint — includes aiResponse */
export interface AnalysisDetail extends AnalysisSummary {
  aiResponse: string;
}

export interface AnalysesResponse {
  analyses: AnalysisSummary[];
}

export interface AnalysisSummaryResponse {
  analysis: AnalysisSummary;
}

export interface AnalysisDetailResponse {
  analysis: AnalysisDetail;
}

export interface CreateAnalysisInput {
  projectId: number;
  prompt: string;
  aiResponse: string;
  modelName?: string | null;
  topic?: string | null;
}

export interface UpdateAnalysisInput {
  prompt?: string;
  aiResponse?: string;
  modelName?: string | null;
  topic?: string | null;
}

// ─── Health endpoint response shapes (from openapi.yaml) ─────────────────────

export interface HealthResponse {
  status: string;
  service: string;
  timestamp?: string;
}

// ─── UI-level status type used by health components ──────────────────────────

export type ServiceStatus = 'loading' | 'online' | 'offline';

export interface ServiceHealth {
  status: ServiceStatus;
  service: string;
  message?: string;
  timestamp?: string;
}

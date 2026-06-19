import client from './client';
import type { HealthResponse } from '../types/api';

// ─── Health endpoints (from openapi.yaml) ─────────────────────────────────────
// These are the only real endpoints available in Phase 1.

export async function getBackendHealth(): Promise<HealthResponse> {
  const res = await client.get<HealthResponse>('/health');
  return res.data;
}

export async function getDatabaseHealth(): Promise<HealthResponse> {
  const res = await client.get<HealthResponse>('/health/database');
  return res.data;
}

export async function getAiServiceHealth(): Promise<HealthResponse> {
  const res = await client.get<HealthResponse>('/health/ai-service');
  return res.data;
}

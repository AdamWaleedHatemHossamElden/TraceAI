// ─── Auth API functions (from openapi.yaml) ───────────────────────────────────
// These are the only functions that call authentication endpoints.
// They return typed data; token storage and user state are handled
// exclusively in AuthContext so API functions stay side-effect-free.

import client from './client';
import type { AuthResponse, CurrentUserResponse } from '../types/api';

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/** POST /auth/register — creates an account and returns user + token. */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await client.post<AuthResponse>('/auth/register', payload);
  return res.data;
}

/** POST /auth/login — authenticates and returns user + token. */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await client.post<AuthResponse>('/auth/login', payload);
  return res.data;
}

/** GET /auth/me — returns the current user from the Bearer token.
 *  Requires the Authorization header to be attached by client.ts interceptor. */
export async function getMe(): Promise<CurrentUserResponse> {
  const res = await client.get<CurrentUserResponse>('/auth/me');
  return res.data;
}

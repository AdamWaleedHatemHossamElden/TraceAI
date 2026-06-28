import client from './client';
import type {
  DocumentSummary,
  DocumentUploadResponse,
  DocumentsListResponse,
  DocumentDetailResponse,
  DocumentContentResponse,
} from '../types/api';

export type { DocumentSummary, DocumentContentResponse };
export type { DocumentChunk } from '../types/api';

/**
 * Upload a document via multipart/form-data.
 * The Content-Type header is removed by the Axios request interceptor in
 * client.ts whenever config.data is a FormData instance, so the browser/XHR
 * can supply the correct 'multipart/form-data; boundary=...' value.
 * Do NOT set Content-Type manually — that would omit the boundary token and
 * break multipart parsing on the server.
 */
export async function uploadDocument(
  projectId: number,
  file: File,
): Promise<DocumentSummary> {
  const formData = new FormData();
  formData.append('projectId', String(projectId));
  formData.append('file', file);
  const res = await client.post<DocumentUploadResponse>('/documents', formData);
  return res.data.document;
}

export async function listDocuments(projectId?: number): Promise<DocumentSummary[]> {
  const params = projectId !== undefined ? { projectId } : undefined;
  const res = await client.get<DocumentsListResponse>('/documents', { params });
  return res.data.documents;
}

export async function getDocument(documentId: number): Promise<DocumentSummary> {
  const res = await client.get<DocumentDetailResponse>(`/documents/${documentId}`);
  return res.data.document;
}

export async function getDocumentContent(
  documentId: number,
): Promise<DocumentContentResponse> {
  const res = await client.get<DocumentContentResponse>(
    `/documents/${documentId}/content`,
  );
  return res.data;
}

export async function deleteDocument(documentId: number): Promise<void> {
  await client.delete(`/documents/${documentId}`);
}

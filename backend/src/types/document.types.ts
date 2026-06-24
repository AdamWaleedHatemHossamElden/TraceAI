export type DocumentMimeType = "application/pdf" | "text/plain";
export type DocumentProcessingStatus = "uploaded" | "extracting" | "processed" | "failed";

export interface DocumentMetadata {
  id: number;
  projectId: number;
  projectName: string;
  originalFilename: string;
  mimeType: DocumentMimeType;
  fileSizeBytes: number;
  processingStatus: DocumentProcessingStatus;
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredDocument extends DocumentMetadata {
  storageKey: string;
}

export interface DocumentChunkInput {
  chunkIndex: number;
  content: string;
  pageNumber: number | null;
  charStart: number;
  charEnd: number;
}

export interface DocumentChunk extends DocumentChunkInput {
  id: number;
}

export interface CreateDocumentInput {
  projectId: number;
  uploadedByUserId: number;
  originalFilename: string;
  storageKey: string;
  mimeType: DocumentMimeType;
  fileSizeBytes: number;
}

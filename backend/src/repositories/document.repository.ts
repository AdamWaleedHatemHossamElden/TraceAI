import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { databasePool } from "../config/database";
import type {
  CreateDocumentInput,
  DocumentChunk,
  DocumentChunkInput,
  DocumentMetadata,
  DocumentMimeType,
  DocumentProcessingStatus,
  StoredDocument
} from "../types/document.types";

interface DocumentRow extends RowDataPacket {
  id: number;
  project_id: number;
  project_name: string;
  original_filename: string;
  storage_key: string;
  mime_type: DocumentMimeType;
  file_size_bytes: number;
  processing_status: DocumentProcessingStatus;
  chunk_count: number;
  created_at: Date | string;
  updated_at: Date | string;
}

interface DocumentChunkRow extends RowDataPacket {
  id: number;
  chunk_index: number;
  content: string;
  page_number: number | null;
  char_start: number;
  char_end: number;
}

const toIsoString = (value: Date | string): string => {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
};

const toStoredDocument = (row: DocumentRow): StoredDocument => ({
  id: row.id,
  projectId: row.project_id,
  projectName: row.project_name,
  originalFilename: row.original_filename,
  storageKey: row.storage_key,
  mimeType: row.mime_type,
  fileSizeBytes: row.file_size_bytes,
  processingStatus: row.processing_status,
  chunkCount: Number(row.chunk_count),
  createdAt: toIsoString(row.created_at),
  updatedAt: toIsoString(row.updated_at)
});

export const toDocumentMetadata = (document: StoredDocument): DocumentMetadata => ({
  id: document.id,
  projectId: document.projectId,
  projectName: document.projectName,
  originalFilename: document.originalFilename,
  mimeType: document.mimeType,
  fileSizeBytes: document.fileSizeBytes,
  processingStatus: document.processingStatus,
  chunkCount: document.chunkCount,
  createdAt: document.createdAt,
  updatedAt: document.updatedAt
});

const toDocumentChunk = (row: DocumentChunkRow): DocumentChunk => ({
  id: row.id,
  chunkIndex: row.chunk_index,
  content: row.content,
  pageNumber: row.page_number,
  charStart: row.char_start,
  charEnd: row.char_end
});

const documentSelect = `
  SELECT documents.id, documents.project_id, projects.name AS project_name,
    documents.original_filename, documents.storage_key, documents.mime_type,
    documents.file_size_bytes, documents.processing_status,
    COUNT(document_chunks.id) AS chunk_count,
    documents.created_at, documents.updated_at
  FROM documents
  INNER JOIN projects ON projects.id = documents.project_id
  LEFT JOIN document_chunks ON document_chunks.document_id = documents.id
`;

export const createDocument = async (input: CreateDocumentInput): Promise<StoredDocument> => {
  const [result] = await databasePool.query<ResultSetHeader>(
    `INSERT INTO documents
      (project_id, uploaded_by_user_id, original_filename, storage_key, mime_type, file_size_bytes, processing_status)
     VALUES (?, ?, ?, ?, ?, ?, 'uploaded')`,
    [
      input.projectId,
      input.uploadedByUserId,
      input.originalFilename,
      input.storageKey,
      input.mimeType,
      input.fileSizeBytes
    ]
  );

  const document = await findDocumentByIdForOwner(result.insertId, input.uploadedByUserId);
  if (!document) {
    throw new Error("Created document could not be loaded.");
  }

  return document;
};

export const updateDocumentStatus = async (
  documentId: number,
  processingStatus: DocumentProcessingStatus
): Promise<void> => {
  await databasePool.query("UPDATE documents SET processing_status = ? WHERE id = ?", [
    processingStatus,
    documentId
  ]);
};

export const replaceChunksAndMarkProcessed = async (
  documentId: number,
  chunks: DocumentChunkInput[]
): Promise<void> => {
  const connection = await databasePool.getConnection();

  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM document_chunks WHERE document_id = ?", [documentId]);

    await insertChunks(connection, documentId, chunks);

    await connection.query("UPDATE documents SET processing_status = 'processed' WHERE id = ?", [documentId]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const insertChunks = async (
  connection: PoolConnection,
  documentId: number,
  chunks: DocumentChunkInput[]
): Promise<void> => {
  if (chunks.length === 0) {
    return;
  }

  await connection.query(
    `INSERT INTO document_chunks
      (document_id, chunk_index, content, page_number, char_start, char_end)
     VALUES ?`,
    [
      chunks.map((chunk) => [
        documentId,
        chunk.chunkIndex,
        chunk.content,
        chunk.pageNumber,
        chunk.charStart,
        chunk.charEnd
      ])
    ]
  );
};

export const listDocumentsForOwner = async (
  ownerUserId: number,
  projectId?: number
): Promise<DocumentMetadata[]> => {
  const values: number[] = [ownerUserId];
  let projectFilter = "";

  if (projectId !== undefined) {
    projectFilter = " AND documents.project_id = ?";
    values.push(projectId);
  }

  const [rows] = await databasePool.query<DocumentRow[]>(
    `${documentSelect}
     WHERE projects.owner_user_id = ?${projectFilter}
     GROUP BY documents.id, documents.project_id, projects.name, documents.original_filename,
       documents.storage_key, documents.mime_type, documents.file_size_bytes,
       documents.processing_status, documents.created_at, documents.updated_at
     ORDER BY documents.created_at DESC`,
    values
  );

  return rows.map(toStoredDocument).map(toDocumentMetadata);
};

export const findDocumentByIdForOwner = async (
  documentId: number,
  ownerUserId: number
): Promise<StoredDocument | null> => {
  const [rows] = await databasePool.query<DocumentRow[]>(
    `${documentSelect}
     WHERE documents.id = ? AND projects.owner_user_id = ?
     GROUP BY documents.id, documents.project_id, projects.name, documents.original_filename,
       documents.storage_key, documents.mime_type, documents.file_size_bytes,
       documents.processing_status, documents.created_at, documents.updated_at
     LIMIT 1`,
    [documentId, ownerUserId]
  );

  return rows[0] ? toStoredDocument(rows[0]) : null;
};

export const listDocumentChunksForOwner = async (
  documentId: number,
  ownerUserId: number
): Promise<DocumentChunk[]> => {
  const [rows] = await databasePool.query<DocumentChunkRow[]>(
    `SELECT document_chunks.id, document_chunks.chunk_index, document_chunks.content,
      document_chunks.page_number, document_chunks.char_start, document_chunks.char_end
     FROM document_chunks
     INNER JOIN documents ON documents.id = document_chunks.document_id
     INNER JOIN projects ON projects.id = documents.project_id
     WHERE documents.id = ? AND projects.owner_user_id = ?
     ORDER BY document_chunks.chunk_index ASC`,
    [documentId, ownerUserId]
  );

  return rows.map(toDocumentChunk);
};

export const deleteDocumentForOwner = async (
  documentId: number,
  ownerUserId: number
): Promise<boolean> => {
  const [result] = await databasePool.query<ResultSetHeader>(
    `DELETE documents
     FROM documents
     INNER JOIN projects ON projects.id = documents.project_id
     WHERE documents.id = ? AND projects.owner_user_id = ?`,
    [documentId, ownerUserId]
  );

  return result.affectedRows > 0;
};

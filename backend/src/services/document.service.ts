import { ApiError } from "../errors/api-error";
import {
  createDocument,
  deleteDocumentForOwner,
  findDocumentByIdForOwner,
  listDocumentChunksForOwner,
  listDocumentsForOwner,
  replaceChunksAndMarkProcessed,
  toDocumentMetadata,
  updateDocumentStatus
} from "../repositories/document.repository";
import { findProjectByIdForOwner } from "../repositories/project.repository";
import { localStorageService } from "../storage/local-storage.service";
import type { DocumentChunk, DocumentMetadata, DocumentMimeType } from "../types/document.types";
import { chunkDocumentText } from "../utils/document-chunker";
import { extractDocumentText } from "./document-extraction.service";

interface UploadDocumentInput {
  ownerUserId: number;
  projectId: number;
  buffer: Buffer;
  originalFilename: string;
  mimeType: DocumentMimeType;
  fileSizeBytes: number;
}

const projectNotFoundError = () => new ApiError(404, "PROJECT_NOT_FOUND", "Project was not found.");
const documentNotFoundError = () => new ApiError(404, "DOCUMENT_NOT_FOUND", "Document was not found.");

export const uploadUserDocument = async (input: UploadDocumentInput): Promise<DocumentMetadata> => {
  const project = await findProjectByIdForOwner(input.projectId, input.ownerUserId);
  if (!project) {
    throw projectNotFoundError();
  }

  const storedFile = await localStorageService.save({
    buffer: input.buffer,
    originalFilename: input.originalFilename,
    mimeType: input.mimeType
  });

  try {
    const document = await createDocument({
      projectId: input.projectId,
      uploadedByUserId: input.ownerUserId,
      originalFilename: storedFile.originalFilename,
      storageKey: storedFile.storageKey,
      mimeType: input.mimeType,
      fileSizeBytes: input.fileSizeBytes
    });

    try {
      await updateDocumentStatus(document.id, "extracting");

      const extractedText = await extractDocumentText(input.buffer, input.mimeType);
      const chunks = chunkDocumentText(extractedText);

      if (chunks.length === 0) {
        throw new ApiError(422, "INVALID_FILE", "No readable text could be extracted from the document.");
      }

      await replaceChunksAndMarkProcessed(document.id, chunks);

      const processedDocument = await findDocumentByIdForOwner(document.id, input.ownerUserId);
      if (!processedDocument) {
        throw documentNotFoundError();
      }

      return toDocumentMetadata(processedDocument);
    } catch (error) {
      await updateDocumentStatus(document.id, "failed");

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(422, "INVALID_FILE", "Document text could not be extracted.");
    }
  } catch (error) {
    if (!(error instanceof ApiError)) {
      await localStorageService.remove(storedFile.storageKey);
    }

    throw error;
  }
};

export const listUserDocuments = async (
  ownerUserId: number,
  projectId?: number
): Promise<DocumentMetadata[]> => {
  if (projectId !== undefined) {
    const project = await findProjectByIdForOwner(projectId, ownerUserId);
    if (!project) {
      throw projectNotFoundError();
    }
  }

  return listDocumentsForOwner(ownerUserId, projectId);
};

export const getUserDocument = async (
  documentId: number,
  ownerUserId: number
): Promise<DocumentMetadata> => {
  const document = await findDocumentByIdForOwner(documentId, ownerUserId);
  if (!document) {
    throw documentNotFoundError();
  }

  return toDocumentMetadata(document);
};

export const getUserDocumentContent = async (
  documentId: number,
  ownerUserId: number
): Promise<{ document: DocumentMetadata; chunks: DocumentChunk[] }> => {
  const document = await findDocumentByIdForOwner(documentId, ownerUserId);
  if (!document) {
    throw documentNotFoundError();
  }

  if (document.processingStatus !== "processed") {
    throw new ApiError(409, "DOCUMENT_NOT_PROCESSED", "Document content is not available yet.");
  }

  const chunks = await listDocumentChunksForOwner(documentId, ownerUserId);

  return {
    document: toDocumentMetadata(document),
    chunks
  };
};

export const deleteUserDocument = async (documentId: number, ownerUserId: number): Promise<void> => {
  const document = await findDocumentByIdForOwner(documentId, ownerUserId);
  if (!document) {
    throw documentNotFoundError();
  }

  const deleted = await deleteDocumentForOwner(documentId, ownerUserId);
  if (!deleted) {
    throw documentNotFoundError();
  }

  await localStorageService.remove(document.storageKey);
};

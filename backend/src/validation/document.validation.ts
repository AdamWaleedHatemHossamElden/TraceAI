import path from "node:path";

import { env } from "../config/env";
import { ApiError } from "../errors/api-error";
import type { DocumentMimeType } from "../types/document.types";

const SUPPORTED_MIME_TYPES: DocumentMimeType[] = ["application/pdf", "text/plain"];

export const validateDocumentId = (value: string | undefined): number => {
  const documentId = Number(value);
  if (!value || !Number.isSafeInteger(documentId) || documentId <= 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "The request contains invalid fields.", [
      { field: "documentId", message: "Document id must be a positive integer." }
    ]);
  }

  return documentId;
};

export const validateProjectId = (value: unknown): number => {
  const projectId = typeof value === "string" ? Number(value) : value;
  if (typeof projectId !== "number" || !Number.isSafeInteger(projectId) || projectId <= 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "The request contains invalid fields.", [
      { field: "projectId", message: "Project id must be a positive integer." }
    ]);
  }

  return projectId;
};

export const validateOptionalProjectId = (value: unknown): { projectId?: number } => {
  if (value === undefined) {
    return {};
  }

  if (Array.isArray(value)) {
    throw new ApiError(400, "VALIDATION_ERROR", "The request contains invalid fields.", [
      { field: "projectId", message: "Project id must be a positive integer." }
    ]);
  }

  return { projectId: validateProjectId(value) };
};

const getSafeOriginalFilename = (originalFilename: string): string => {
  const normalized = originalFilename.trim().replace(/\\/g, "/");
  const basename = path.basename(normalized);

  if (!basename || basename === "." || basename === ".." || basename.includes("\0")) {
    throw new ApiError(400, "INVALID_FILE", "Uploaded file is invalid.", [
      { field: "file", message: "Original filename is invalid." }
    ]);
  }

  if (basename.length > 255) {
    throw new ApiError(400, "INVALID_FILE", "Uploaded file is invalid.", [
      { field: "file", message: "Original filename must be at most 255 characters." }
    ]);
  }

  return basename;
};

const validateMimeType = (mimeType: string): DocumentMimeType => {
  if (!SUPPORTED_MIME_TYPES.includes(mimeType as DocumentMimeType)) {
    throw new ApiError(400, "INVALID_FILE_TYPE", "Only PDF and plain-text files are supported.", [
      { field: "file", message: "Supported MIME types are application/pdf and text/plain." }
    ]);
  }

  return mimeType as DocumentMimeType;
};

const validateFileSignature = (buffer: Buffer, mimeType: DocumentMimeType) => {
  if (mimeType === "application/pdf" && buffer.subarray(0, 5).toString("utf8") !== "%PDF-") {
    throw new ApiError(400, "INVALID_FILE", "Uploaded file is invalid.", [
      { field: "file", message: "PDF file signature is invalid." }
    ]);
  }

  if (mimeType === "text/plain" && buffer.includes(0)) {
    throw new ApiError(400, "INVALID_FILE", "Uploaded file is invalid.", [
      { field: "file", message: "Plain-text file appears to contain binary content." }
    ]);
  }
};

export const validateUploadedDocumentFile = (file: Express.Multer.File | undefined) => {
  if (!file) {
    throw new ApiError(400, "FILE_REQUIRED", "A document file is required.", [
      { field: "file", message: "Upload exactly one file using the file field." }
    ]);
  }

  if (file.size === 0) {
    throw new ApiError(400, "INVALID_FILE", "Uploaded file is invalid.", [
      { field: "file", message: "Uploaded file cannot be empty." }
    ]);
  }

  if (file.size > env.uploadMaxFileSizeBytes) {
    throw new ApiError(413, "FILE_TOO_LARGE", "Uploaded file is too large.", [
      { field: "file", message: `Maximum file size is ${env.uploadMaxFileSizeBytes} bytes.` }
    ]);
  }

  const mimeType = validateMimeType(file.mimetype);
  validateFileSignature(file.buffer, mimeType);

  return {
    buffer: file.buffer,
    originalFilename: getSafeOriginalFilename(file.originalname),
    mimeType,
    fileSizeBytes: file.size
  };
};

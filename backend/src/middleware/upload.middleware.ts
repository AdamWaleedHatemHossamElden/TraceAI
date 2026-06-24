import type { NextFunction, Request, Response } from "express";
import multer from "multer";

import { env } from "../config/env";
import { ApiError } from "../errors/api-error";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.uploadMaxFileSizeBytes,
    files: 1
  }
}).single("file");

const mapMulterError = (error: multer.MulterError): ApiError => {
  if (error.code === "LIMIT_FILE_SIZE") {
    return new ApiError(413, "FILE_TOO_LARGE", "Uploaded file is too large.", [
      { field: "file", message: `Maximum file size is ${env.uploadMaxFileSizeBytes} bytes.` }
    ]);
  }

  if (error.code === "LIMIT_UNEXPECTED_FILE" || error.code === "LIMIT_FILE_COUNT") {
    return new ApiError(400, "INVALID_FILE", "Upload exactly one file using the file field.", [
      { field: "file", message: "Use the multipart field name file and upload only one file." }
    ]);
  }

  return new ApiError(400, "INVALID_FILE", "Multipart upload request is invalid.");
};

export const singleDocumentUpload = (request: Request, response: Response, next: NextFunction) => {
  upload(request, response, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      next(mapMulterError(error));
      return;
    }

    next(new ApiError(400, "INVALID_FILE", "Multipart upload request is invalid."));
  });
};

import { Router } from "express";

import {
  deleteDocument,
  getDocument,
  getDocumentContent,
  listDocuments,
  uploadDocument
} from "../controllers/document.controller";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth.middleware";
import { singleDocumentUpload } from "../middleware/upload.middleware";
import { asyncHandler } from "../utils/async-handler";

export const documentRouter = Router();

documentRouter.use(authenticate);

documentRouter.post(
  "/",
  singleDocumentUpload,
  asyncHandler((request, response) => uploadDocument(request as AuthenticatedRequest, response))
);
documentRouter.get(
  "/",
  asyncHandler((request, response) => listDocuments(request as AuthenticatedRequest, response))
);
documentRouter.get(
  "/:documentId",
  asyncHandler((request, response) => getDocument(request as AuthenticatedRequest, response))
);
documentRouter.get(
  "/:documentId/content",
  asyncHandler((request, response) => getDocumentContent(request as AuthenticatedRequest, response))
);
documentRouter.delete(
  "/:documentId",
  asyncHandler((request, response) => deleteDocument(request as AuthenticatedRequest, response))
);

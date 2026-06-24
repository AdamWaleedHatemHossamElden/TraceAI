import type { Response } from "express";

import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  deleteUserDocument,
  getUserDocument,
  getUserDocumentContent,
  listUserDocuments,
  uploadUserDocument
} from "../services/document.service";
import {
  validateDocumentId,
  validateOptionalProjectId,
  validateProjectId,
  validateUploadedDocumentFile
} from "../validation/document.validation";

export const uploadDocument = async (request: AuthenticatedRequest, response: Response) => {
  const projectId = validateProjectId(request.body.projectId);
  const file = validateUploadedDocumentFile(request.file);

  const document = await uploadUserDocument({
    ownerUserId: request.user!.userId,
    projectId,
    ...file
  });

  response.status(201).json({ document });
};

export const listDocuments = async (request: AuthenticatedRequest, response: Response) => {
  const { projectId } = validateOptionalProjectId(request.query.projectId);
  const documents = await listUserDocuments(request.user!.userId, projectId);

  response.status(200).json({ documents });
};

export const getDocument = async (request: AuthenticatedRequest, response: Response) => {
  const documentId = validateDocumentId(request.params.documentId);
  const document = await getUserDocument(documentId, request.user!.userId);

  response.status(200).json({ document });
};

export const getDocumentContent = async (request: AuthenticatedRequest, response: Response) => {
  const documentId = validateDocumentId(request.params.documentId);
  const result = await getUserDocumentContent(documentId, request.user!.userId);

  response.status(200).json(result);
};

export const deleteDocument = async (request: AuthenticatedRequest, response: Response) => {
  const documentId = validateDocumentId(request.params.documentId);
  await deleteUserDocument(documentId, request.user!.userId);

  response.status(204).send();
};

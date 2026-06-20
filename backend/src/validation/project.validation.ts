import { ApiError, type ApiErrorDetail } from "../errors/api-error";
import type { UpdateProjectInput } from "../types/project.types";

const ensurePlainObject = (body: unknown): Record<string, unknown> => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "VALIDATION_ERROR", "The request contains invalid fields.", [
      { message: "Request body must be an object." }
    ]);
  }

  return body as Record<string, unknown>;
};

const rejectUnexpectedFields = (
  body: Record<string, unknown>,
  allowedFields: string[],
  details: ApiErrorDetail[]
) => {
  const allowed = new Set(allowedFields);
  for (const field of Object.keys(body)) {
    if (!allowed.has(field)) {
      details.push({ field, message: "This field is not allowed." });
    }
  }
};

export const validateProjectId = (value: string | undefined): number => {
  const projectId = Number(value);
  if (!value || !Number.isSafeInteger(projectId) || projectId <= 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "The request contains invalid fields.", [
      { field: "projectId", message: "Project id must be a positive integer." }
    ]);
  }

  return projectId;
};

const validateName = (value: unknown, details: ApiErrorDetail[]): string => {
  if (typeof value !== "string") {
    details.push({ field: "name", message: "Project name is required." });
    return "";
  }

  const name = value.trim();
  if (name.length < 1 || name.length > 255) {
    details.push({ field: "name", message: "Project name must be between 1 and 255 characters." });
  }

  return name;
};

const validateDescription = (value: unknown, details: ApiErrorDetail[]): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    details.push({ field: "description", message: "Description must be a string or null." });
    return null;
  }

  return value.trim();
};

export const validateCreateProjectRequest = (body: unknown) => {
  const parsed = ensurePlainObject(body);
  const details: ApiErrorDetail[] = [];

  rejectUnexpectedFields(parsed, ["name", "description"], details);

  const name = validateName(parsed.name, details);
  const description = validateDescription(parsed.description, details);

  if (details.length > 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "The request contains invalid fields.", details);
  }

  return { name, description };
};

export const validateUpdateProjectRequest = (body: unknown): UpdateProjectInput => {
  const parsed = ensurePlainObject(body);
  const details: ApiErrorDetail[] = [];
  const update: UpdateProjectInput = {};

  rejectUnexpectedFields(parsed, ["name", "description"], details);

  if (Object.prototype.hasOwnProperty.call(parsed, "name")) {
    update.name = validateName(parsed.name, details);
  }

  if (Object.prototype.hasOwnProperty.call(parsed, "description")) {
    update.description = validateDescription(parsed.description, details);
  }

  if (!Object.prototype.hasOwnProperty.call(update, "name") && !Object.prototype.hasOwnProperty.call(update, "description")) {
    details.push({ message: "At least one update field is required." });
  }

  if (details.length > 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "The request contains invalid fields.", details);
  }

  return update;
};

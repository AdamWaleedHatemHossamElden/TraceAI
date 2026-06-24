import { ApiError, type ApiErrorDetail } from "../errors/api-error";
import type { UpdateAnalysisInput } from "../types/analysis.types";

const PROMPT_MAX_LENGTH = 50000;
const AI_RESPONSE_MAX_LENGTH = 750000;
const OPTIONAL_TEXT_MAX_LENGTH = 255;

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

export const validatePositiveInteger = (value: unknown, field: string): number => {
  const parsed = typeof value === "string" ? Number(value) : value;
  if (typeof parsed !== "number" || !Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "The request contains invalid fields.", [
      { field, message: `${field} must be a positive integer.` }
    ]);
  }

  return parsed;
};

export const validateAnalysisId = (value: string | undefined): number => {
  return validatePositiveInteger(value, "analysisId");
};

const validateRequiredText = (
  value: unknown,
  field: string,
  maxLength: number,
  details: ApiErrorDetail[]
): string => {
  if (typeof value !== "string") {
    details.push({ field, message: `${field} is required.` });
    return "";
  }

  const text = value.trim();
  if (text.length < 1 || text.length > maxLength) {
    details.push({ field, message: `${field} must be between 1 and ${maxLength} characters.` });
  }

  return text;
};

const validateOptionalText = (
  value: unknown,
  field: string,
  details: ApiErrorDetail[]
): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    details.push({ field, message: `${field} must be a string or null.` });
    return null;
  }

  const text = value.trim();
  if (text.length === 0) {
    return null;
  }

  if (text.length > OPTIONAL_TEXT_MAX_LENGTH) {
    details.push({ field, message: `${field} must be at most ${OPTIONAL_TEXT_MAX_LENGTH} characters.` });
  }

  return text;
};

export const validateCreateAnalysisRequest = (body: unknown) => {
  const parsed = ensurePlainObject(body);
  const details: ApiErrorDetail[] = [];

  rejectUnexpectedFields(parsed, ["projectId", "prompt", "aiResponse", "modelName", "topic"], details);

  let projectId = 0;
  try {
    projectId = validatePositiveInteger(parsed.projectId, "projectId");
  } catch (error) {
    if (error instanceof ApiError) {
      details.push(...error.details);
    } else {
      throw error;
    }
  }

  const prompt = validateRequiredText(parsed.prompt, "prompt", PROMPT_MAX_LENGTH, details);
  const aiResponse = validateRequiredText(parsed.aiResponse, "aiResponse", AI_RESPONSE_MAX_LENGTH, details);
  const modelName = validateOptionalText(parsed.modelName, "modelName", details);
  const topic = validateOptionalText(parsed.topic, "topic", details);

  if (details.length > 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "The request contains invalid fields.", details);
  }

  return { projectId, prompt, aiResponse, modelName, topic };
};

export const validateListAnalysesQuery = (queryProjectId: unknown): { projectId?: number } => {
  if (queryProjectId === undefined) {
    return {};
  }

  if (Array.isArray(queryProjectId)) {
    throw new ApiError(400, "VALIDATION_ERROR", "The request contains invalid fields.", [
      { field: "projectId", message: "projectId must be a positive integer." }
    ]);
  }

  return { projectId: validatePositiveInteger(queryProjectId, "projectId") };
};

export const validateUpdateAnalysisRequest = (body: unknown): UpdateAnalysisInput => {
  const parsed = ensurePlainObject(body);
  const details: ApiErrorDetail[] = [];
  const update: UpdateAnalysisInput = {};

  rejectUnexpectedFields(parsed, ["prompt", "aiResponse", "modelName", "topic"], details);

  if (Object.prototype.hasOwnProperty.call(parsed, "prompt")) {
    update.prompt = validateRequiredText(parsed.prompt, "prompt", PROMPT_MAX_LENGTH, details);
  }

  if (Object.prototype.hasOwnProperty.call(parsed, "aiResponse")) {
    update.aiResponse = validateRequiredText(parsed.aiResponse, "aiResponse", AI_RESPONSE_MAX_LENGTH, details);
  }

  if (Object.prototype.hasOwnProperty.call(parsed, "modelName")) {
    update.modelName = validateOptionalText(parsed.modelName, "modelName", details);
  }

  if (Object.prototype.hasOwnProperty.call(parsed, "topic")) {
    update.topic = validateOptionalText(parsed.topic, "topic", details);
  }

  if (
    !Object.prototype.hasOwnProperty.call(update, "prompt") &&
    !Object.prototype.hasOwnProperty.call(update, "aiResponse") &&
    !Object.prototype.hasOwnProperty.call(update, "modelName") &&
    !Object.prototype.hasOwnProperty.call(update, "topic")
  ) {
    details.push({ message: "At least one update field is required." });
  }

  if (details.length > 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "The request contains invalid fields.", details);
  }

  return update;
};

import { ApiError, type ApiErrorDetail } from "../errors/api-error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ensurePlainObject = (body: unknown): Record<string, unknown> => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "VALIDATION_ERROR", "The request contains invalid fields.", [
      { message: "Request body must be an object." }
    ]);
  }

  return body as Record<string, unknown>;
};

const validateUnexpectedFields = (
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

const normalizeEmail = (value: unknown, details: ApiErrorDetail[]): string => {
  if (typeof value !== "string") {
    details.push({ field: "email", message: "Email is required." });
    return "";
  }

  const email = value.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    details.push({ field: "email", message: "Enter a valid email address." });
  }

  return email;
};

const validatePassword = (value: unknown, details: ApiErrorDetail[]): string => {
  if (typeof value !== "string") {
    details.push({ field: "password", message: "Password is required." });
    return "";
  }

  if (value.trim().length === 0) {
    details.push({ field: "password", message: "Password cannot be empty." });
  }

  if (value.length < 8) {
    details.push({ field: "password", message: "Password must be at least 8 characters." });
  }

  if (value.length > 72) {
    details.push({ field: "password", message: "Password must be at most 72 characters." });
  }

  return value;
};

export const validateRegisterRequest = (body: unknown) => {
  const parsed = ensurePlainObject(body);
  const details: ApiErrorDetail[] = [];

  validateUnexpectedFields(parsed, ["fullName", "email", "password"], details);

  const fullName = typeof parsed.fullName === "string" ? parsed.fullName.trim() : "";
  if (typeof parsed.fullName !== "string") {
    details.push({ field: "fullName", message: "Full name is required." });
  } else if (fullName.length < 2 || fullName.length > 100) {
    details.push({ field: "fullName", message: "Full name must be between 2 and 100 characters." });
  }

  const email = normalizeEmail(parsed.email, details);
  const password = validatePassword(parsed.password, details);

  if (details.length > 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "The request contains invalid fields.", details);
  }

  return { fullName, email, password };
};

export const validateLoginRequest = (body: unknown) => {
  const parsed = ensurePlainObject(body);
  const details: ApiErrorDetail[] = [];

  validateUnexpectedFields(parsed, ["email", "password"], details);

  const email = normalizeEmail(parsed.email, details);
  const password = validatePassword(parsed.password, details);

  if (details.length > 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "The request contains invalid fields.", details);
  }

  return { email, password };
};

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details: ApiErrorDetail[];

  constructor(statusCode: number, code: string, message: string, details: ApiErrorDetail[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

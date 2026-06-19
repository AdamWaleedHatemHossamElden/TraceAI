import type { ErrorRequestHandler } from "express";

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  const statusCode = typeof error.statusCode === "number" ? error.statusCode : 500;
  const code = typeof error.code === "string" ? error.code : "INTERNAL_SERVER_ERROR";
  const message =
    statusCode === 500 ? "An unexpected error occurred." : error.message || "Request failed.";

  response.status(statusCode).json({
    error: {
      code,
      message,
      details: error.details || []
    }
  });
};

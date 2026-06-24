# TraceAI API Contract

`docs/openapi.yaml` is the source of truth. This document summarizes the Phase 1 contract.

## Base URLs
- Backend API: `http://localhost:5000/api`
- AI service: `http://localhost:8000`

## Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "details": [
      {
        "field": "email",
        "message": "Enter a valid email."
      }
    ]
  }
}
```

## Backend Endpoints

### `GET /api/health`
Returns backend service health.

Response:
```json
{
  "status": "ok",
  "service": "traceai-backend",
  "timestamp": "2026-06-19T00:00:00.000Z"
}
```

### `POST /api/auth/register`
Creates a public user account with the `user` role and returns an access token.

Request:
```json
{
  "fullName": "Adam Hatem",
  "email": "adam@example.com",
  "password": "StrongPassword123!"
}
```

Success response:
```json
{
  "user": {
    "id": 1,
    "fullName": "Adam Hatem",
    "email": "adam@example.com",
    "role": "user"
  },
  "accessToken": "...",
  "expiresIn": "1h"
}
```

Duplicate email response:
```json
{
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "An account with this email already exists.",
    "details": []
  }
}
```

### `POST /api/auth/login`
Authenticates a user and returns an access token.

Request:
```json
{
  "email": "adam@example.com",
  "password": "StrongPassword123!"
}
```

Success response:
```json
{
  "user": {
    "id": 1,
    "fullName": "Adam Hatem",
    "email": "adam@example.com",
    "role": "user"
  },
  "accessToken": "...",
  "expiresIn": "1h"
}
```

Invalid credentials response:
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect.",
    "details": []
  }
}
```

### `GET /api/auth/me`
Returns the current user from MySQL.

Required header:
```http
Authorization: Bearer <access-token>
```

Success response:
```json
{
  "user": {
    "id": 1,
    "fullName": "Adam Hatem",
    "email": "adam@example.com",
    "role": "user"
  }
}
```

Unauthorized response:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication is required.",
    "details": []
  }
}
```

## Project Endpoints

All project endpoints require:
```http
Authorization: Bearer <access-token>
```

### `POST /api/projects`
Creates a project for the authenticated user.

Request:
```json
{
  "name": "Project name",
  "description": "Optional description"
}
```

Success response:
```json
{
  "project": {
    "id": 1,
    "name": "Project name",
    "description": "Optional description",
    "createdAt": "2026-06-20T00:00:00.000Z",
    "updatedAt": "2026-06-20T00:00:00.000Z"
  }
}
```

### `GET /api/projects`
Returns projects owned by the authenticated user, ordered by most recently updated.

Success response:
```json
{
  "projects": []
}
```

### `GET /api/projects/:projectId`
Returns one project if it belongs to the authenticated user.

Success response:
```json
{
  "project": {
    "id": 1,
    "name": "Project name",
    "description": "Optional description",
    "createdAt": "2026-06-20T00:00:00.000Z",
    "updatedAt": "2026-06-20T00:00:00.000Z"
  }
}
```

### `PATCH /api/projects/:projectId`
Updates one or more allowed project fields.

Request:
```json
{
  "name": "Updated project name",
  "description": null
}
```

Success response:
```json
{
  "project": {
    "id": 1,
    "name": "Updated project name",
    "description": null,
    "createdAt": "2026-06-20T00:00:00.000Z",
    "updatedAt": "2026-06-20T00:00:00.000Z"
  }
}
```

### `DELETE /api/projects/:projectId`
Deletes a project if it belongs to the authenticated user.

Success response: `204 No Content`

Missing or unauthorized project response:
```json
{
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project was not found.",
    "details": []
  }
}
```

## Analysis Endpoints

All analysis endpoints require:
```http
Authorization: Bearer <access-token>
```

### `POST /api/analyses`
Creates a draft analysis inside a project owned by the authenticated user.

Request:
```json
{
  "projectId": 1,
  "prompt": "What caused the recent temperature increase?",
  "aiResponse": "The AI-generated answer to verify.",
  "modelName": "GPT-4",
  "topic": "Climate"
}
```

Success response:
```json
{
  "analysis": {
    "id": 1,
    "projectId": 1,
    "projectName": "Climate Verification",
    "prompt": "What caused the recent temperature increase?",
    "aiResponse": "The AI-generated answer to verify.",
    "modelName": "GPT-4",
    "topic": "Climate",
    "status": "draft",
    "createdAt": "2026-06-20T10:00:00.000Z",
    "updatedAt": "2026-06-20T10:00:00.000Z"
  }
}
```

Missing or unauthorized project response:
```json
{
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project was not found.",
    "details": []
  }
}
```

### `GET /api/analyses`
Returns analyses from projects owned by the authenticated user, ordered by most recently updated.

Optional filter:
```http
GET /api/analyses?projectId=1
```

Success response:
```json
{
  "analyses": [
    {
      "id": 1,
      "projectId": 1,
      "projectName": "Climate Verification",
      "prompt": "What caused the recent temperature increase?",
      "modelName": "GPT-4",
      "topic": "Climate",
      "status": "draft",
      "createdAt": "2026-06-20T10:00:00.000Z",
      "updatedAt": "2026-06-20T10:00:00.000Z"
    }
  ]
}
```

### `GET /api/analyses/:analysisId`
Returns one complete analysis, including `aiResponse`, when it belongs to the authenticated user.

### `PATCH /api/analyses/:analysisId`
Updates one or more allowed analysis fields.

Request:
```json
{
  "prompt": "Updated prompt",
  "aiResponse": "Updated AI-generated answer.",
  "modelName": null,
  "topic": "Climate"
}
```

Success response uses the same complete `analysis` shape as create/get.

### `DELETE /api/analyses/:analysisId`
Deletes one analysis when it belongs to the authenticated user.

Success response: `204 No Content`

Missing or unauthorized analysis response:
```json
{
  "error": {
    "code": "ANALYSIS_NOT_FOUND",
    "message": "Analysis was not found.",
    "details": []
  }
}
```

### `GET /api/health/database`
Runs a simple MySQL connectivity check.

Success response:
```json
{
  "status": "ok",
  "service": "traceai-database"
}
```

Failure response:
```json
{
  "error": {
    "code": "DATABASE_UNAVAILABLE",
    "message": "Database health check failed.",
    "details": []
  }
}
```

### `GET /api/health/ai-service`
Requests the Python AI service health endpoint.

Success response:
```json
{
  "status": "ok",
  "service": "traceai-ai-service"
}
```

Failure response:
```json
{
  "error": {
    "code": "AI_SERVICE_UNAVAILABLE",
    "message": "AI service health check failed.",
    "details": []
  }
}
```

## AI Service Endpoints

### `GET /health`
Returns AI service health.

Response:
```json
{
  "status": "ok",
  "service": "traceai-ai-service"
}
```

## Future Endpoint Groups
- Authentication: register, login, current user.
- Projects: create, list, retrieve.
- Documents: upload, status, extracted chunks.
- Analyses: create, retrieve, list claims.
- Reviews: submit human review decisions.
- Dashboard: reliability and verification metrics.

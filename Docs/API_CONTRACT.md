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

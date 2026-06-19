# TraceAI Development Instructions

## Ownership
- `backend/`, `ai-service/`, `database/`, and backend/service documentation are Codex-owned after task approval.
- `frontend/` is reserved for a later frontend phase and must not be modified unless explicitly requested.
- `docs/openapi.yaml` is the source of truth for API request and response contracts.

## Working Rules
- Do not commit real secrets, tokens, passwords, private keys, user uploads, or production database exports.
- Use safe examples only in `.env.example` files.
- Do not run services, tests, builds, package installs, migrations, seeds, Docker, Git, or database commands unless the owner explicitly changes the rule.
- Keep Phase 1 focused on architecture, contracts, schema, and health-check foundations.

## Backend Rules
- Use Node.js, Express, and TypeScript.
- Use strict TypeScript settings.
- Use `mysql2` directly with repository and service layers; do not use an ORM.
- Validate inputs before reaching services or repositories.
- Return consistent API errors.
- Use bcrypt password hashing and JWT access tokens when authentication is implemented in a later phase.

## AI Service Rules
- Use Python, FastAPI, and `requirements.txt`.
- Keep AI pipeline concerns inside `ai-service/`.
- Defer embeddings, vector search, semantic retrieval, and classification models to later phases.
- Expose health endpoints early so service wiring can be verified.

## Database Rules
- Use MySQL.
- Store document metadata and text chunks in MySQL.
- Defer vector search design until the Python AI service phase.
- Migrations must be ordered and safe to review before execution.

## Storage Rules
- Start with local filesystem storage for uploaded evidence.
- Access storage through a storage service interface so cloud storage can replace it later.

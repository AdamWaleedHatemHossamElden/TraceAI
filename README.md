# TraceAI

TraceAI is a human-in-the-loop platform for claim-level verification of AI-generated answers against uploaded evidence documents.

## Phase 1 Scope
- Repository safety and ownership rules.
- Documentation and API contract foundation.
- MySQL schema and safe development seed SQL.
- Node.js, Express, and TypeScript backend foundation.
- Python FastAPI AI-service foundation.
- Backend and AI-service health endpoints.
- Docker Compose configuration for later local service orchestration.

No frontend pages are included in Phase 1.

## Planned Stack
- Backend: Node.js, Express, TypeScript, `mysql2`.
- AI service: Python, FastAPI.
- Database: MySQL.
- Frontend later: React, TypeScript, Vite.
- Local service configuration: Docker Compose may be used after review.

## Manual Setup Commands

Run these manually when you are ready. Do not paste real secrets into committed files.

### Backend
```bash
cd backend
npm install
npm run typecheck
npm run dev
```

Phase 2 adds these backend dependencies for authentication:
- `bcrypt`
- `jsonwebtoken`
- `@types/bcrypt`
- `@types/jsonwebtoken`

### AI Service
```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### MySQL With Docker Compose
```bash
docker compose up mysql
```

### All Services With Docker Compose
```bash
docker compose up --build
```

### Apply Database Files Manually
Review SQL files before applying them. Migrations must be executed in order: `001`, then `002`, then optional seed files.

```bash
mysql -h 127.0.0.1 -P 3306 -u traceai_user -p traceai < database/migrations/001_initial_schema.sql
mysql -h 127.0.0.1 -P 3306 -u traceai_user -p traceai < database/migrations/002_add_user_full_name.sql
mysql -h 127.0.0.1 -P 3306 -u traceai_user -p traceai < database/seeds/001_development_seed.sql
```

## Health Endpoints
- Backend: `GET http://localhost:5000/api/health`
- Backend database: `GET http://localhost:5000/api/health/database`
- Backend AI service check: `GET http://localhost:5000/api/health/ai-service`
- AI service: `GET http://localhost:8000/health`

## Authentication Endpoints
- Register: `POST http://localhost:5000/api/auth/register`
- Login: `POST http://localhost:5000/api/auth/login`
- Current user: `GET http://localhost:5000/api/auth/me`

Registration creates public accounts with the `user` role only. `reviewer` and `admin` accounts must be created through controlled database or admin workflows in a later phase.

## Environment
Copy `.env.example` to local `.env` files as needed and replace placeholder values locally. Never commit real `.env` files.

## Current Verification Status
Files were created without running installs, tests, builds, migrations, Docker, services, or database connections. You will run verification manually.

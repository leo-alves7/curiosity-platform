# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Architecture Overview

Curiosity Platform is a map-based store explorer — a location-aware platform where users can discover and browse stores on an interactive map. Built as a monorepo with a FastAPI backend and a React/TypeScript frontend.

### Components
- **Backend**: Python FastAPI application in `backend/` directory
- **Frontend**: React/TypeScript webapp in `webapp/` directory
- **Tech Stack**: FastAPI, SQLAlchemy (async), PostgreSQL, Redis, Celery, React, Material UI, MapLibre GL JS

### Project Structure
```
curiosity-platform/
├── backend/
│   ├── curiosity/
│   │   ├── web/
│   │   │   ├── routers/        # Feature-based FastAPI routers
│   │   │   ├── managers/       # Business logic
│   │   │   ├── model/          # SQLAlchemy ORM models
│   │   │   └── dependencies/   # FastAPI dependency injection
│   │   └── common/
│   │       ├── model/          # Base SQLAlchemy model (UUID PK, soft delete)
│   │       ├── configuration.py
│   │       └── alembic/        # Database migrations
│   ├── pyproject.toml
│   └── Dockerfile
├── webapp/
│   ├── src/
│   │   ├── api/                # Axios client and API hooks
│   │   ├── components/         # Reusable UI components
│   │   ├── features/           # Feature-scoped logic
│   │   ├── pages/              # Page-level components
│   │   ├── slices/             # Redux state slices
│   │   └── auth/               # Keycloak auth integration
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yaml
└── README.md
```

## Common Development Commands

### Backend
```bash
# Setup (run once)
uv sync
uv run alembic upgrade head

# Development server
uv run uvicorn curiosity.web.main:app --reload --port 8081

# Migrations
uv run alembic upgrade head          # Apply migrations
uv run alembic downgrade -1          # Roll back one migration

# Testing
uv run pytest tests/ -n auto         # All tests in parallel
uv run pytest tests/unit/            # Unit tests only
uv run pytest tests/integration/     # Integration tests only

# Linting / formatting
uv run ruff check --fix .
uv run ruff format .
uv run mypy curiosity/
```

### Frontend
```bash
cd webapp/
npm install         # Install dependencies
npm run dev         # Development server (port 5173)
npm run build       # Production build
npm run test        # Run tests (watch mode)
npm run test:run    # Run tests once
npm run typecheck   # TypeScript type checking
npm run lint        # ESLint
```

### Local Services (Docker)
```bash
docker compose up -d        # Start all services (PostgreSQL, Redis, Keycloak, MinIO, Maildev)
docker compose down         # Stop all services
docker compose logs -f db   # Follow database logs
```

## Key Architecture Concepts

### Backend Patterns
- **Routers**: Feature-based modules in `curiosity/web/routers/`, each file exports a `*_router` variable
- **Handler naming**: Route handler functions are prefixed with `handle_` (e.g. `handle_get_stores`)
- **Managers**: Business logic lives in `curiosity/web/managers/`, not inside routers
- **Dependency injection**: FastAPI `Depends()` for DB sessions, auth, and shared services
- **Async throughout**: All handlers, DB queries, and I/O are async (`async def`, `AsyncSession`, `asyncpg`)
- **Base model**: All ORM models inherit from `Base` — includes UUID PK, `created_at`, `updated_at`, `deleted_at` (soft delete, auto-filtered)
- **Pydantic v2**: Request/response schemas use `BaseModel` with `model_config = ConfigDict(from_attributes=True)`
- **Configuration**: `pydantic-settings` with `.env` file for local config

### Frontend Patterns
- **API client**: Singleton Axios instance in `src/api/client.ts`
- **State management**: Redux Toolkit slices in `src/slices/`
- **Auth**: Keycloak JS adapter — token injected automatically into all requests
- **UI**: Material UI (MUI v6) + Emotion for all components and icons
- **Map**: MapLibre GL JS for the interactive store map
- **Testing**: Vitest + React Testing Library; use `msw` for API mocking

### Database
- PostgreSQL 15+ with `asyncpg` driver
- Alembic migrations using raw SQL via `op.execute()` — see rules in `.claude/rules/backend/alembic-migration.md`
- UUID primary keys on all tables
- Soft deletes via `deleted_at` column (auto-filtered by Base)

### Authentication
- Keycloak (OIDC / JWT RS256) for all user auth
- Backend: JWT token verified via python-keycloak, injected as FastAPI dependency
- Frontend: `keycloak-js` adapter handles login redirect and token refresh

## Development Workflow

1. Start services: `docker compose up -d`
2. Run backend: `uv run uvicorn curiosity.web.main:app --reload --port 8081`
3. Run frontend: `cd webapp && npm run dev`
4. Keycloak admin at http://localhost:8180 (admin/admin)
5. MinIO console at http://localhost:9001
6. Maildev at http://localhost:1080

## Jira Project

- Board: https://curiosity-platform.atlassian.net/jira/software/projects/CSTY/boards/1
- Issue key prefix: `CSTY`
- Use the `get-jira-issue` skill to fetch issue details
- Use the `implementor` skill to implement a Jira issue end-to-end

## Important Rules

- **NEVER** add an import anywhere other than the top of the file, unless explicitly told to do so
- **NEVER** use `op.add_column()`, `op.create_index()`, or other SQLAlchemy Alembic helpers — always use `op.execute()` with raw SQL
- **ALWAYS** use `IF EXISTS` / `IF NOT EXISTS` in Alembic migrations
- `uv` is the Python package manager — never use `pip install` directly
- Pre-commit hooks enforce `ruff` formatting and linting — run `uv run ruff check --fix` and `uv run ruff format` before committing

# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Vision

Curiosity is a **mobile-first, real-time store discovery platform** — Google Maps + TripAdvisor + Waze, focused on helping people find and explore nearby stores. See `.claude/PROJECT_VISION.md` for the full product vision, two-tab architecture, user types, monetization plan, current implementation state, and active epic details. Read it at the start of any planning or implementation session.

## Architecture Overview

Curiosity Platform is a map-based store explorer — a location-aware platform where users can discover and browse stores on an interactive map. Built as a monorepo with a FastAPI backend and a React/TypeScript frontend.

### Two User Types
- **Normal users** — browse map, filter stores, add new places they discover
- **Enterprise owners** — claim store listings, add catalogues/photos/videos, manage sponsorship

### Two Main Tabs (mobile-first layout)
- **Tab 1 — Navigation Map** — real-time MapLibre map, store markers, GPS location, Waze-like navigation, gamified 3D view (pitch 45° default)
- **Tab 2 — Store Explorer** — iFOOD-style scrollable list, search, category filters, store detail views

### Components
- **Backend**: Python FastAPI application in `backend/` directory
- **Frontend**: React/TypeScript webapp in `webapp/` directory
- **Tech Stack**: FastAPI, SQLAlchemy (async), PostgreSQL, Redis, Celery, Ionic React, MapLibre GL JS

### Project Structure
```
curiosity-platform/
├── backend/
│   ├── curiosity/
│   │   ├── web/
│   │   │   ├── routers/        # Feature-based FastAPI routers (HTTP handlers only)
│   │   │   ├── managers/       # Business logic
│   │   │   ├── model/          # SQLAlchemy ORM models
│   │   │   ├── schemas/        # Pydantic request/response/validation models
│   │   │   ├── services/       # External service clients (Firebase, MinIO) — no business logic
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
│   │   ├── components/         # Shared-only reusable UI components (Layout/, AppTabs/)
│   │   ├── features/           # Feature-scoped components
│   │   │   ├── map/            # MapView, clustering, GPS, FABs, StorePopup
│   │   │   ├── stores/         # StoreList, StoreDetail, AddStore flows
│   │   │   └── admin/          # Admin store/category management
│   │   ├── hooks/              # Shared React hooks
│   │   ├── pages/              # Page-level components
│   │   ├── slices/             # Redux state slices (7 slices)
│   │   └── auth/               # Firebase auth integration
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
npm run build       # Production build (outputs to webapp/dist)
npm run test        # Run tests (watch mode)
npm run test:run    # Run tests once
npm run typecheck   # TypeScript type checking
npm run lint        # ESLint
```

### Frontend — Cloudflare deployment
```bash
cd webapp/
npx wrangler login    # authenticate (first time only)
npm run build
npx wrangler deploy   # deploys webapp/dist to Cloudflare Workers
```

Config: `wrangler.jsonc` at repo root — worker name is `project-curiosity`, assets directory is `./webapp/dist`.

### Local Services (Docker)
```bash
docker compose up -d        # Start all services (PostgreSQL, Redis, MinIO, Maildev)
docker compose down         # Stop all services
docker compose logs -f db   # Follow database logs
```

## Key Architecture Concepts

### Backend Patterns
- **Routers**: Feature-based modules in `curiosity/web/routers/`, each file exports a `*_router` variable
- **Handler naming**: Route handler functions are prefixed with `handle_` (e.g. `handle_get_stores`)
- **Managers**: Business logic lives in `curiosity/web/managers/`, not inside routers
- **Schemas**: Pydantic request/response/validation models live in `curiosity/web/schemas/` — separate from ORM models in `model/`
- **Services**: External service clients (Firebase Admin SDK, MinIO client, Stripe future) live in `curiosity/web/services/` — no business logic here, services only wrap external API clients
- **Dependency injection**: FastAPI `Depends()` for DB sessions, auth, and shared services
- **Async throughout**: All handlers, DB queries, and I/O are async (`async def`, `AsyncSession`, `asyncpg`)
- **Base model**: All ORM models inherit from `Base` — includes UUID PK, `created_at`, `updated_at`, `deleted_at` (soft delete, auto-filtered)
- **Pydantic v2**: Request/response schemas use `BaseModel` with `model_config = ConfigDict(from_attributes=True)`
- **Configuration**: `pydantic-settings` with `.env` file for local config
- **New endpoint checklist**: schema in `schemas/`, logic in manager, handler in router — never put ORM queries or business logic directly in routers

### Frontend Patterns
- **API client**: Singleton Axios instance in `src/api/client.ts`
- **State management**: Redux Toolkit slices in `src/slices/`
- **Auth**: Firebase Auth — `onAuthStateChanged` drives Redux state; token injected automatically into all requests via Axios interceptor
- **UI**: Ionic React — mobile-first components and icons. This is the primary UI framework. Do NOT use MUI.
- **Map**: MapLibre GL JS for the interactive store map
- **Testing**: Vitest + React Testing Library; use `msw` for API mocking

### Database
- PostgreSQL 15+ with `asyncpg` driver
- Alembic migrations using raw SQL via `op.execute()` — see rules in `.claude/rules/backend/alembic-migration.md`
- UUID primary keys on all tables
- Soft deletes via `deleted_at` column (auto-filtered by Base)

### Authentication
- Firebase Auth (Google, Apple, email/password) for all user auth
- Backend: Firebase ID token verified via `firebase-admin` SDK (`firebase_admin.auth.verify_id_token`), injected as FastAPI dependency; `UserContext` carries `uid` and `email`
- Frontend: `@capacitor-firebase/authentication` + Firebase JS SDK; `useAuth` hook subscribes to `onAuthStateChanged`, dispatches to Redux

## Development Workflow

1. Start services: `docker compose up -d`
2. Run backend: `uv run uvicorn curiosity.web.main:app --reload --port 8081`
3. Run frontend: `cd webapp && npm run dev`
4. MinIO console at http://localhost:9001
5. Maildev at http://localhost:1080

## Jira Project

- Board: https://curiosity-platform.atlassian.net/jira/software/projects/CSTY/boards/1
- Issue key prefix: `CSTY`
- Use the `get-jira-issue` skill to fetch issue details
- Use the `implementor` skill to implement a Jira issue end-to-end

## Session Protocol

At the start of any planning or implementation session, read all memory files in `.claude/memory/` before reading any ticket or starting any work.

## New Machine Setup

After cloning the repo on a new machine, these steps restore the full development environment:

### 1. Install tools
```bash
# macOS
brew install uv node gh
brew install --cask docker

# Install acli (Atlassian CLI)
npm install -g @anthropic/acli   # or follow https://acli.atlassian.com

# Node dependencies
cd webapp && npm install
cd ../backend && uv sync
```

### 2. Recreate .claude/settings.local.json (gitignored)
```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(uv run ruff check:*)", "Bash(uv run ruff format:*)",
      "Bash(uv run pytest:*)", "Bash(uv run mypy:*)",
      "Bash(uv run alembic:*)", "Bash(uv run uvicorn:*)",
      "Bash(uv sync:*)", "Bash(uv add:*)", "Bash(uv remove:*)", "Bash(uv run:*)",
      "Bash(npm run:*)", "Bash(npm install:*)", "Bash(npx prettier:*)",
      "Bash(docker compose:*)",
      "Bash(git checkout:*)", "Bash(git branch:*)", "Bash(git add:*)",
      "Bash(git commit:*)", "Bash(git push:*)", "Bash(git diff:*)",
      "Bash(git status:*)", "Bash(git log:*)",
      "Bash(gh pr create:*)", "Bash(gh pr list:*)", "Bash(gh pr view:*)",
      "Bash(acli jira workitem view:*)", "Bash(acli jira workitem create:*)",
      "Bash(acli jira workitem edit:*)", "Bash(acli jira workitem search:*)",
      "Bash(python3:*)", "Bash(python -c:*)", "Bash(ls:*)",
      "WebFetch(domain:curiosity-platform.atlassian.net)",
      "WebFetch(domain:github.com)"
    ],
    "deny": []
  },
  "hooks": {
    "Stop": [{
      "matcher": "",
      "hooks": [{"type": "command", "command": "echo '\\n[MEMORY REMINDER] Run /memory-update to save session state to memory before ending.'"}]
    }]
  },
  "enableAllProjectMcpServers": true
}
```

### 3. Recreate .mcp.json (gitignored — contains API token)
```json
{
  "mcpServers": {
    "jira": {
      "command": "uvx",
      "args": ["mcp-atlassian"],
      "env": {
        "JIRA_URL": "https://curiosity-platform.atlassian.net",
        "JIRA_USERNAME": "leandro.curiosityteam@gmail.com",
        "JIRA_API_TOKEN": "<token from 1Password>"
      }
    }
  }
}
```

### 4. Recreate credentials (get from 1Password / secure transfer)
- `backend/.env` — PostgreSQL, Firebase project ID, MinIO, Redis config
- `backend/service-account.json` — Firebase Admin SDK service account JSON
- `webapp/.env.local` — Firebase web API key, auth domain, app ID, API URL

### 5. Authenticate CLI tools
```bash
gh auth login               # GitHub CLI
acli jira auth login        # Atlassian CLI → site: curiosity-platform.atlassian.net
```

### 6. Start services and verify
```bash
docker compose up -d
cd backend && uv run alembic upgrade head
cd backend && uv run uvicorn curiosity.web.main:app --reload --port 8081
cd webapp && npm run dev
```

Memory is fully available immediately after clone — all memory files are in `.claude/memory/` and travel with the repo.

## Important Rules

- **NEVER** add an import anywhere other than the top of the file, unless explicitly told to do so
- **NEVER** use `op.add_column()`, `op.create_index()`, or other SQLAlchemy Alembic helpers — always use `op.execute()` with raw SQL
- **ALWAYS** use `IF EXISTS` / `IF NOT EXISTS` in Alembic migrations
- `uv` is the Python package manager — never use `pip install` directly
- Pre-commit hooks enforce `ruff` formatting and linting — run `uv run ruff check --fix` and `uv run ruff format` before committing

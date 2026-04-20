# Curiosity Platform

Curiosity Platform is a map-based store explorer — a platform where users can discover, browse, and interact with stores and points of interest on an interactive map. Think of it as a foundation for location-aware commerce experiences.

The project is being rebuilt from scratch with a production-grade stack inspired by [PredictAP Platform](https://github.com/predictap/platform), adopting its patterns for backend architecture, database management, authentication, and frontend tooling.

---

## Project Structure

```
curiosity-platform/
├── backend/                   # FastAPI backend
│   ├── curiosity/
│   │   ├── web/               # Routers, dependencies, request/response models
│   │   │   ├── routers/       # Feature-based API routers
│   │   │   ├── managers/      # Business logic
│   │   │   ├── model/         # SQLAlchemy ORM models
│   │   │   └── dependencies/  # FastAPI dependency injection
│   │   └── common/            # Shared utilities, base models, config
│   │       └── alembic/       # Database migrations
│   ├── pyproject.toml
│   └── Dockerfile
├── webapp/                    # React + TypeScript frontend
│   ├── src/
│   │   ├── api/               # Axios client and API hooks
│   │   ├── components/        # Reusable UI components
│   │   ├── features/          # Feature-scoped logic
│   │   ├── pages/             # Page-level components
│   │   ├── slices/            # Redux state slices
│   │   └── auth/              # Keycloak auth integration
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yaml        # Local development services
└── README.md
```

---

## Tech Stack

### Backend
| Concern | Technology |
|---|---|
| Framework | FastAPI (async) |
| Language | Python 3.12+ |
| Package Manager | uv |
| Database | PostgreSQL 15+ |
| ORM | SQLAlchemy 2.x (async) with asyncpg |
| Migrations | Alembic |
| Caching / Broker | Redis |
| Background Tasks | Celery + Celery Beat |
| Auth | Keycloak (OpenID Connect / JWT RS256) |
| Config | pydantic-settings |
| Linting / Formatting | Ruff + mypy |
| Testing | pytest + pytest-asyncio |

### Frontend
| Concern | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite + SWC |
| State Management | Redux Toolkit + Redux Persist |
| HTTP Client | Axios |
| UI Components / Icons | Material UI (MUI v6) + Emotion |
| Map | MapLibre GL JS |
| Auth | Keycloak JS adapter |
| Testing | Vitest + React Testing Library |

### Infrastructure (local dev via Docker Compose)
| Service | Purpose |
|---|---|
| PostgreSQL | Primary database |
| Redis | Cache and Celery broker |
| Keycloak | Authentication server (port 8180) |
| MinIO | S3-compatible object storage |
| Maildev | Email testing UI (port 1080) |

---

## Features (Planned)

- Interactive map with **MapLibre GL JS** showing store locations
- Store detail popups and sidepanels
- User authentication via **Keycloak** (login, roles, JWT)
- Store management API (CRUD) backed by PostgreSQL
- Categories, tags, and filtering for stores
- Background sync tasks via **Celery** (e.g. indexing, notifications)
- Object storage for store images via **MinIO / S3**
- Multi-environment configuration (local, staging, production)

---

## Getting Started

### Prerequisites

- Docker + Docker Compose
- Node.js (LTS)
- Python 3.12+
- [uv](https://github.com/astral-sh/uv)

### 1. Start local services

```bash
docker compose up -d
```

This starts PostgreSQL, Redis, Keycloak, MinIO, and Maildev.

### 2. Backend setup

```bash
cd backend
uv sync
uv run alembic upgrade head
uv run uvicorn curiosity.web.main:app --reload --port 8081
```

### 3. Frontend setup

```bash
cd webapp
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.
Backend API available at [http://localhost:8081](http://localhost:8081).
Keycloak admin at [http://localhost:8180](http://localhost:8180).

---

## API Design

RESTful endpoints following the same modular router pattern as PredictAP Platform:

```
GET  /stores              # List stores (with filters)
POST /stores              # Create a store
GET  /stores/{id}         # Get store details
PUT  /stores/{id}         # Update a store
DELETE /stores/{id}       # Delete a store
GET  /categories          # List categories
```

---

## Development Notes

- Pre-commit hooks via `ruff` for formatting and linting
- Async throughout: `asyncpg` driver, async SQLAlchemy sessions, async FastAPI handlers
- Base model includes `uuid` PKs, `created_at`, `updated_at`, `deleted_at` (soft delete)
- Auth token injected into all API requests via Keycloak JS adapter on the frontend

---

## License

MIT License

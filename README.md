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
│   │   │   ├── schemas/       # Pydantic request/response schemas
│   │   │   ├── services/      # Infrastructure services (e.g. Firebase)
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
│   │   └── auth/              # Firebase auth integration
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
| Auth | Firebase Admin SDK (JWT RS256 verification) |
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
| UI Components / Icons | Ionic React + ionicons (mobile-first) |
| Map | MapLibre GL JS |
| Routing | React Router v6 |
| Auth | Firebase Auth + @capacitor-firebase/authentication |
| Testing | Vitest + React Testing Library |

### Infrastructure (local dev via Docker Compose)
| Service | Purpose |
|---|---|
| PostgreSQL | Primary database |
| Redis | Cache and Celery broker |
| Firebase | Authentication (Google, Apple, email/password) |
| MinIO | S3-compatible object storage |
| Maildev | Email testing UI (port 1080) |

---

## Features

- **Interactive map** with **MapLibre GL JS** — store pins, click-to-open popups (name, category, address), map position preserved in Redux across navigation — fully implemented
- **Store list sidebar** — scrollable panel alongside the map with real-time name search (debounced 300 ms), category filter tabs, infinite scroll pagination, loading/empty states; clicking a card pans the map and opens its popup — fully implemented
- **Store management API (CRUD)** backed by PostgreSQL — fully implemented at `/api/v1/stores`
- **Category management API (CRUD)** for grouping and filtering stores — fully implemented at `/api/v1/categories`
- User authentication via **Firebase Auth** (Google, Apple, email/password)
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

This starts PostgreSQL, Redis, MinIO, and Maildev.

### 2. Backend setup

```bash
cd backend
cp .env.example .env   # edit values as needed
uv sync                # creates .venv and installs all dependencies
uv run alembic upgrade head
uv run uvicorn curiosity.web.main:app --reload --port 8081
```

### 3. Frontend setup

```bash
cd webapp
cp .env.example .env.local   # edit values as needed
npm install
npm run dev
```

### 4. Pre-commit hooks (backend)

```bash
cd backend
uv sync --extra dev        # installs pre-commit along with other dev deps
uv run pre-commit install  # registers hooks in .git/hooks/
```

Open [http://localhost:5173](http://localhost:5173) to view the app.
Backend API available at [http://localhost:8081](http://localhost:8081).

---

## API Design

RESTful endpoints following the same modular router pattern as PredictAP Platform:

```
GET  /health                    # Health check — returns {"status": "ok"} (public)

GET  /me                        # Returns authenticated user's claims (requires Bearer JWT)

GET  /api/v1/stores             # List stores — query params: category_id, is_active, search, page, page_size
POST /api/v1/stores             # Create a store (auth required) — returns 201
GET  /api/v1/stores/{id}        # Get store by id — returns 404 if not found or soft-deleted
PUT  /api/v1/stores/{id}        # Update a store (auth required) — partial update supported
DELETE /api/v1/stores/{id}      # Soft-delete a store (auth required) — returns 204

GET    /api/v1/categories           # List all active categories — query params: page, page_size (includes stores)
POST   /api/v1/categories           # Create a category (auth required) — returns 201
GET    /api/v1/categories/{id}      # Get category by id (includes stores) — 404 if not found or soft-deleted
PUT    /api/v1/categories/{id}      # Update a category (auth required) — partial update supported
DELETE /api/v1/categories/{id}      # Soft-delete a category (auth required) — returns 204; stores retain FK as NULL
```

---

## Development Notes

- Pre-commit hooks via `ruff` (lint + format) and `mypy` — run `pre-commit install` once after cloning
- Async throughout: `asyncpg` driver, async SQLAlchemy sessions, async FastAPI handlers
- Base model includes `uuid` PKs, `created_at`, `updated_at`, `deleted_at` (soft delete); soft-deleted records are automatically excluded from all ORM queries via a `do_orm_execute` event listener — no manual filtering required
- Inject the database session into route handlers using `DbSession` from `curiosity.web.dependencies`: `async def handle_foo(session: DbSession) -> ...`
- The `db_session` async fixture is available in all tests via `tests/conftest.py`; tests that use it must add `pytestmark = pytest.mark.xdist_group("db")` to prevent parallel-create race conditions
- Frontend auth: `useAuth` hook subscribes to Firebase Auth state via `onAuthStateChanged`, dispatches `setAuth`/`clearAuth` to Redux, and exposes `signInWithGoogle()`, `signInWithApple()`, `signInWithEmailAndPassword()`, and `signOut()`. The `useAuth` hook is called in `App.tsx`; the app renders a spinner until the initial auth state resolves.
- `ProtectedRoute` reads `isAuthenticated` from Redux and redirects unauthenticated users to `/login`; `LoginPage` redirects authenticated users to `/`
- Axios client injects Firebase ID token as `Authorization: Bearer` on each request; a 401 response triggers `user.getIdToken(true)` (force refresh) and a single retry before calling `signOut`
- Frontend env vars (set in `webapp/.env.local`): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, `VITE_API_URL`, `VITE_MAPLIBRE_STYLE_URL` (optional — defaults to `https://demotiles.maplibre.org/style.json`) — see `webapp/.env.example`
- Protect backend routes by declaring `current_user: CurrentUser` in any handler (or `dependencies=[Depends(get_current_user)]` at router level); import `CurrentUser` from `curiosity.web.dependencies`; `UserContext` carries `uid` and `email` from the verified Firebase ID token
- Backend env vars (set in `backend/.env`): `FIREBASE_PROJECT_ID` (required for token verification) — see `backend/.env.example`

---

## Deployment

The frontend is deployed to **Cloudflare Workers** (static assets via Wrangler). The config lives at `wrangler.jsonc` in the repo root.

### Frontend — deploy to Cloudflare

```bash
cd webapp && npm run build   # outputs to webapp/dist
cd .. && npx wrangler deploy # deploys webapp/dist to Cloudflare Workers
```

> First-time setup: run `npx wrangler login` to authenticate.

**Cloudflare dashboard build settings** (Workers > project-curiosity > Settings > Builds):
- Build command: `cd webapp && npm run build`
- Deploy command: `npx wrangler deploy`

### Backend — deployment TBD

Backend deployment target is not yet defined. Likely a containerised service (Docker + cloud run or VPS). Update this section once the deployment target is confirmed.

---

## License

MIT License

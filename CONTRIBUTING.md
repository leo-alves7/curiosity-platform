# Contributing to Curiosity Platform

A guide for developers making their first contribution. Read this top-to-bottom once, then use it as a reference.

For architecture detail beyond what's here, see [CLAUDE.md](CLAUDE.md).

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Docker + Docker Compose | latest | [docs.docker.com](https://docs.docker.com/get-docker/) |
| Node.js | 20+ LTS | `brew install node` or [nodejs.org](https://nodejs.org) |
| uv (Python package manager) | latest | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| gh CLI | latest | `brew install gh` then `gh auth login` |

---

## First-time setup

```bash
git clone https://github.com/<org>/curiosity-platform && cd curiosity-platform
docker compose up -d                                          # PostgreSQL, Redis, MinIO, Maildev
cd backend && cp .env.example .env && uv sync && uv run alembic upgrade head
uv run uvicorn curiosity.web.main:app --reload --port 8081   # backend at :8081
cd ../webapp && cp .env.example .env.local && npm install && npm run dev  # frontend at :5173
```

Install pre-commit hooks once (backend linting gates commits):

```bash
cd backend && uv run pre-commit install
```

See [README.md](README.md) for credential setup (Firebase, MinIO env vars) if you need auth to work locally.

---

## How the project is organized

**Backend** (`backend/curiosity/web/`) — routers handle HTTP only; managers hold business logic; schemas are Pydantic models for request/response; services wrap external clients (Firebase, MinIO). All handlers are async.

**Frontend** (`webapp/src/`) — features live under `features/<area>/`; shared components under `components/`; global state in `slices/` (Redux Toolkit); API calls via Axios hooks in `api/`. UI framework is Ionic React — never MUI. Icons are `lucide-react` only.

**Infrastructure** — PostgreSQL with Alembic migrations (raw SQL via `op.execute()` only); Redis for cache/Celery; MinIO for object storage; Firebase Auth for all user auth.

See [CLAUDE.md](CLAUDE.md) for the full layer contract and naming rules.

---

## Walkthrough A — Add a backend endpoint

New endpoints follow the schema → manager → router → test order. Never put queries or business logic directly in routers.

**1. Schema** (`backend/curiosity/web/schemas/<feature>.py`) — add a Pydantic `BaseModel` with `model_config = ConfigDict(from_attributes=True)` for the response shape.

**2. Manager** (`backend/curiosity/web/managers/<feature>_manager.py`) — write a standalone async function that takes an `AsyncSession` and returns the schema. Raise `HTTPException` for domain errors.

**3. Router** (`backend/curiosity/web/routers/<feature>.py`) — add a handler prefixed with `handle_`, inject `session: DbSession`, call the manager, return the schema.

**4. Test** — write the failing test first (`tests/unit/test_<feature>_manager.py`), then implement. Tests that hit the DB must set `pytestmark = pytest.mark.xdist_group("db")`.

**5. Lint and run**
```bash
uv run ruff check --fix . && uv run ruff format .
uv run mypy curiosity/
uv run pytest tests/ -n auto
```

---

## Walkthrough B — Add a frontend component

**1. Component** — create `webapp/src/features/<area>/<ComponentName>.tsx`. Use Ionic React components (`IonCard`, `IonBadge`, etc.). Never hardcode user-facing strings.

**2. i18n** — add the key to both `webapp/src/locales/en.json` and `webapp/src/locales/pt-BR.json`. Use `const { t } = useTranslation()` in the component.

**3. Redux slice** — only if the component needs shared state. Add a field to an existing slice in `webapp/src/slices/`. If state is purely local, use `useState`.

**4. Test** — write the failing test first (`<ComponentName>.test.tsx`), using Vitest + React Testing Library. Mock API calls with `msw`.

**5. Lint and run**
```bash
npm run typecheck
npm run lint
npm run test:run
```

---

## How to use Claude skills

This project ships Claude Code skills for common workflows. Run these from within Claude Code (`claude`).

| Task | Skill | When to use |
|------|-------|-------------|
| Implement a Jira ticket end-to-end | `/implementor` | Any feature or bug fix with a CSTY ticket |
| Commit, push, and open a PR | `/commit-push-pr` | Quick fixes without a ticket |
| Save session state to memory | `/memory-update` | End of every session |
| Review your own changes | `/code-reviewer` | Before opening a PR |

To fetch a Jira ticket before starting work: `/get-jira-issue CSTY-42`

---

## PR checklist

- [ ] `uv run pytest tests/ -n auto` passes
- [ ] `uv run ruff check .` is clean
- [ ] `uv run mypy curiosity/` is clean
- [ ] `npm run typecheck` and `npm run test:run` pass
- [ ] New i18n keys added to **both** `en.json` and `pt-BR.json`
- [ ] No hardcoded user-facing strings in JSX
- [ ] No MUI imports; no `IonIcon`/`ionicons` in new code
- [ ] Alembic migrations use `op.execute()` with raw SQL and `IF EXISTS`/`IF NOT EXISTS`
- [ ] PR title references the Jira ticket: `CSTY-42 — short description`

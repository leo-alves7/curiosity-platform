---
paths:
  - "backend/curiosity/**/*.py"
---

# Backend Architecture Rules

## Layer Responsibilities

Each layer has a strict, non-overlapping responsibility. Violating these boundaries is the most common source of bugs and untestability in this codebase.

### `routers/` — HTTP only
Handler functions ONLY. Rules:
- Named `handle_<verb>_<noun>` (e.g. `handle_get_stores`, `handle_create_category`)
- Always `async def`
- Never contain ORM queries or business logic
- Call a manager method, return a schema — nothing else
- Export a `*_router` variable from each file

```python
# correct
@router.get("/stores", response_model=list[StoreResponse])
async def handle_get_stores(session: DbSession, user: CurrentUser) -> list[StoreResponse]:
    return await store_manager.get_stores(session, user)

# wrong — ORM query directly in a router
async def handle_get_stores(session: DbSession) -> list[StoreResponse]:
    result = await session.execute(select(Store))  # belongs in a manager
    ...
```

### `managers/` — All business logic
Business decisions, validation rules, orchestration. Called by routers. May call `services/` for external API operations. Never imported directly by `schemas/` or `model/`.

### `model/` — ORM only
SQLAlchemy ORM class definitions only. No methods with business logic. No Pydantic schemas. All models inherit from `Base` (UUID PK, `created_at`, `updated_at`, `deleted_at` — soft delete auto-filtered).

### `schemas/` — Pydantic only
Request/response/validation Pydantic models only. Separate from ORM models in `model/`. Use `model_config = ConfigDict(from_attributes=True)` for response schemas that serialize ORM instances.

### `services/` — External client wrappers
Firebase Admin SDK, MinIO client, Stripe (future). No business logic here — services wrap the external API and nothing else. Business decisions about what to store or when to call the service live in managers.

### `dependencies/` — FastAPI Depends() factories
`DbSession`, `CurrentUser`, `AdminUser`, and similar. Injected via `Depends()` into handler signatures. No business logic.

---

## Adding a New Endpoint — Checklist

Every new endpoint requires these steps in order:

1. **Schema** — add request and response Pydantic models to `schemas/<domain>.py`
2. **Manager** — add the business logic method to `managers/<domain>_manager.py`
3. **Handler** — add the HTTP handler to `routers/<domain>.py`, calling the manager
4. **Register** — if this is a new router file, include it in `web/main.py`
5. **Test** — add a unit test in `tests/unit/web/test_<domain>_manager.py`

Never skip the schema or manager step. Never put ORM queries directly in a router.

---

## Naming Rules

| Thing | Convention | Example |
|---|---|---|
| Router variable | `<domain>_router` | `stores_router` |
| Handler function | `handle_<verb>_<noun>` | `handle_get_stores` |
| Manager method | plain verb_noun | `get_stores`, `create_store` |
| Schema class | `<Noun>Request` / `<Noun>Response` | `StoreRequest`, `StoreResponse` |

---

## Test Coverage Rules

- Every manager method needs at least one test in `tests/unit/web/test_<domain>_manager.py`
- Use the `db_session` fixture — never mock DB operations. Tests that use `db_session` must add `pytestmark = pytest.mark.xdist_group("db")` for correct parallel isolation.
- Mock only external services: Firebase, MinIO, Stripe. Never mock SQLAlchemy sessions or ORM models.
- Integration tests live in `tests/integration/` and may hit real services in a Docker environment.
---
name: Backend Architecture — Layer Responsibilities
description: FastAPI layer responsibilities, naming conventions, and new-endpoint checklist for the Curiosity backend
type: user
originSessionId: 52b396a5-4cd4-444e-b5ea-9ac6a3ab08c8
---
## Layer Responsibilities

| Layer | Directory | Role |
|---|---|---|
| Routers | `curiosity/web/routers/` | HTTP handlers only — named `handle_*()`, `async def`, export a `*_router` variable |
| Managers | `curiosity/web/managers/` | All business logic — called by routers, never inline in handlers |
| ORM Models | `curiosity/web/model/` | SQLAlchemy ORM classes only |
| Schemas | `curiosity/web/schemas/` | Pydantic request/response/validation models — NOT the same as `model/` |
| Services | `curiosity/web/services/` | External service clients (Firebase Admin SDK, MinIO client) — no business logic |
| Dependencies | `curiosity/web/dependencies/` | FastAPI `Depends()` factories |
| Common/model | `curiosity/common/model/` | Base SQLAlchemy model (UUID PK, soft delete, `created_at`, `updated_at`, `deleted_at`) |

## New Endpoint Checklist

Every new endpoint requires:
1. Schema in `schemas/` (Pydantic request/response models)
2. Business logic in a manager in `managers/`
3. HTTP handler in `routers/` — calls manager, does NOT contain ORM queries

Never put business logic or ORM queries directly in routers.

## Key Patterns

- **Soft delete**: `deleted_at` column auto-filtered via `do_orm_execute` event listener — no manual `WHERE deleted_at IS NULL` needed
- **Auth injection**: `current_user: CurrentUser` in handler signature or `dependencies=[Depends(get_current_user)]` at router level
- **Admin guard**: `AdminUser = Annotated[UserContext, Depends(require_admin)]` — raises 403 if `role` claim is not `"admin"`
- **DB session**: `session: DbSession` from `curiosity.web.dependencies`
- **Test isolation**: tests using `db_session` fixture must add `pytestmark = pytest.mark.xdist_group("db")`

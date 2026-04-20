---
paths:
  - "**/*_test.py"
---

# Instructions for testing with Python files

## Database

We run an in-memory/test database for tests. You should NOT mock DB operations; instead, interact with the database as you would in production.

## PyTest fixtures

Fixtures are defined in `conftest.py` files. The most commonly used ones:

File: `tests/conftest.py`
- `db_session` — async SQLAlchemy session for DB operations
- `settings` — application settings (CuriositySettings)

File: `tests/unit/conftest.py`
- `active_user` — creates a test user for authenticated scenarios

File: `tests/unit/web/conftest.py`
- `api_client` — async test client for hitting API endpoints directly

## General guidelines

- When testing a function that produces different results based on different states, use `@pytest.mark.parametrize` to test multiple scenarios.
- Separate testing setup / data with `@pytest.fixture` to keep test logic clean.
- Use `pytest-asyncio` for async test functions — annotate with `@pytest.mark.asyncio`.
- Do not mock database sessions — use the `db_session` fixture which provides a real connection to the test DB.
- Mock only external services (Keycloak, S3/MinIO, external HTTP APIs).

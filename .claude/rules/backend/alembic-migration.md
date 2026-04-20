---
paths:
  - "**/alembic/versions/*.py"
---

# Instructions for writing alembic migrations

## Create new version

run `alembic revision -m "<revision name>"`

## Record IDs

Use UUID for record ID.

When adding a new record to the database, use hard coded UUID so you can refer to it in the `downgrade` operation.

## Code Standards

### 1. Use `op.execute()` with raw SQL

**ALWAYS** write migrations using `op.execute()` with raw SQL statements. Do NOT use SQLAlchemy's declarative methods like `op.add_column()`, `op.create_index()`, etc.

```python
def upgrade():
    op.execute(
        """
        ALTER TABLE table_name
        ADD COLUMN IF NOT EXISTS column_name VARCHAR(255);
        """
    )

def downgrade():
    op.execute(
        """
        ALTER TABLE table_name
        DROP COLUMN IF EXISTS column_name;
        """
    )
```

### 2. Always use multi-line strings for SQL

Format SQL queries with proper indentation inside triple quotes:

```python
def upgrade():
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_table_column
        ON public.table_name (column_name);
        """
    )
```

### 3. Use IF EXISTS/IF NOT EXISTS for safety

Always use conditional DDL to prevent errors on re-runs:

```sql
-- Creating
CREATE INDEX IF NOT EXISTS idx_name ON table (column);
CREATE TABLE IF NOT EXISTS table_name (...);
ALTER TABLE table_name ADD COLUMN IF NOT EXISTS column_name TYPE;

-- Dropping
DROP INDEX IF EXISTS idx_name;
DROP TABLE IF EXISTS table_name;
ALTER TABLE table_name DROP COLUMN IF EXISTS column_name;
```

### 4. Common Migration Patterns

#### Adding a column

```python
def upgrade():
    op.execute(
        """
        ALTER TABLE table_name
        ADD COLUMN IF NOT EXISTS column_name UUID
        REFERENCES other_table(id);
        """
    )

def downgrade():
    op.execute(
        """
        ALTER TABLE table_name
        DROP COLUMN IF EXISTS column_name;
        """
    )
```

#### Creating an index

```python
def upgrade():
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_table_column
        ON public.table_name (column_name);
        """
    )

def downgrade():
    op.execute(
        """
        DROP INDEX IF EXISTS idx_table_column;
        """
    )
```

---
name: alembic-migration
description: A skill to create Alembic database migration files. Use when asked to create a migration, add a column, create a table, add an index, or any database schema change. Examples: "create a migration to add X column", "write a migration for Y table".
allowed-tools: Bash(uv run alembic:*), Bash(python -c:*), Read, Edit, Glob
---

The user wants to create an Alembic migration. Follow these steps:

## Step 1: Determine the migration name

Use `$0` as the migration description if provided, otherwise infer a short snake_case name from the user's request.

## Step 2: Locate alembic.ini

Search for `alembic.ini` in the project using Glob. Use the directory containing `alembic.ini` as the working directory for the alembic command.

## Step 3: Create the revision file

Run the alembic command to generate the file (do NOT create it manually):

```
cd <directory containing alembic.ini> && uv run alembic revision -m "<migration_name>"
```

This produces a file under `alembic/versions/`. Read its exact path from the command output.

## Step 4: Read the generated file

Read the generated file so you can edit it.

## Step 5: Implement upgrade() and downgrade()

Edit the generated file and implement both functions following these rules:

### Rules

1. **Always use `op.execute()` with raw SQL** — never use `op.add_column()`, `op.create_index()`, or other SQLAlchemy declarative helpers.

2. **Use multi-line triple-quoted strings** for all SQL.

3. **Use `IF EXISTS` / `IF NOT EXISTS`** in all DDL to prevent errors on re-runs.

4. **Use hard-coded UUIDs** when inserting records so they can be referenced in `downgrade()`. Generate a UUID with `python -c "import uuid; print(uuid.uuid4())"` if needed.

5. Always implement a proper `downgrade()` that reverses the `upgrade()`.

### Patterns

#### Add a column
```python
def upgrade():
    op.execute(
        """
        ALTER TABLE table_name
        ADD COLUMN IF NOT EXISTS column_name UUID REFERENCES other_table(id);
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

#### Create a table
```python
def upgrade():
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS table_name (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            deleted_at TIMESTAMP WITH TIME ZONE
        );
        """
    )

def downgrade():
    op.execute(
        """
        DROP TABLE IF EXISTS table_name;
        """
    )
```

#### Create an index
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

#### Insert seed data
```python
def upgrade():
    op.execute(
        """
        INSERT INTO table_name (id, name)
        VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'seed value')
        ON CONFLICT (id) DO NOTHING;
        """
    )

def downgrade():
    op.execute(
        """
        DELETE FROM table_name
        WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
        """
    )
```

## Step 6: Report back

Tell the user the generated file path and summarise the migration that was written.

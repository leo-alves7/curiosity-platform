---
name: format-code
description: Format changed files. Formats JS/JSX/TS/TSX with prettier and Python files with ruff. Use it after making changes or before creating commits.
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(npx prettier:*), Bash(uv run ruff:*)
model: claude-haiku-4-5
---

- Changed files (staged and unstaged): !`git diff --name-only HEAD && git ls-files --others --exclude-standard`

Follow these steps in order:

## Step 1: Format JS/JSX/TS/TSX files

From the changed files list, identify any `.js`, `.jsx`, `.ts`, `.tsx` files. Skip if there are none.

First, find the nearest `.prettierrc` (or `.prettierrc.json`, `.prettierrc.js`, `.prettierrc.yaml`, `.prettierrc.yml`, `prettier.config.js`, `prettier.config.cjs`) by searching from the project root upward:

```
find . -maxdepth 3 \( -name ".prettierrc*" -o -name "prettier.config.*" \) | head -5
```

If a config file is found, run prettier from the directory containing the config file:

```
cd <config-file-directory> && npx prettier --write <file1> <file2> ...
```

Use absolute paths for the files so the `cd` doesn't break the paths.

If no config file is found, run without `--config`:

```
npx prettier --write <file1> <file2> ...
```

Skip if there are no such files.

## Step 2: Format Python files

From the changed files list, identify any `.py` files. Run each of the following in order (skip if no `.py` files):

```
uv run ruff format <files...>
uv run ruff check --fix <files...>
```

## Notes

- Only operate on files that appear in the changed files list — do not format unrelated files

---
name: memory-update
description: End-of-session memory skill. Reviews what changed this session, interactively decides which memories to update or create, updates project_state.md and DECISIONS.md, and keeps the MEMORY.md index accurate.
allowed-tools: Read, Write, Edit, Bash(git log:*), Bash(git diff:*), Bash(git status:*)
---

You are running the **memory-update** skill. Your job is to capture what was learned or decided this session so future sessions start with accurate, complete memory. Be selective — only write memories for things that are non-obvious, non-derivable from the code, and useful across sessions.

---

## Step 1 — Read current state

Read both of these in parallel:

1. `~/.claude/projects/-home-leo-Documents-projects-personal-curiosity-platform/memory/MEMORY.md`
2. `~/.claude/projects/-home-leo-Documents-projects-personal-curiosity-platform/memory/project_state.md`

---

## Step 2 — Gather session diff

Run these commands to understand what changed this session:

```
git log --oneline origin/main..HEAD
git diff origin/main --name-only
git status
```

---

## Step 3 — Evaluate each changed area interactively

For each changed area (file, module, or topic), ask yourself:

> "Is there something here that future-Claude could NOT derive by reading the current code or git history?"

If YES — this is a candidate memory. If NO — skip it.

For each candidate, present it to the user in this format before writing:

```
CANDIDATE MEMORY:
Type: [user | feedback | project | reference]
File: [memory filename if new, or existing file to update]
Content summary: [1-2 sentences on what would be saved]

Write this memory? (say yes/no and any changes)
```

Wait for the user to respond before writing each memory. This prevents low-quality memory accumulation.

---

## Step 4 — Update project_state.md

Always update `project_state.md` regardless of other memory changes. Mark any newly completed tickets, add any new patterns or gotchas discovered, and remove or correct anything that is now stale.

---

## Step 5 — Update DECISIONS.md (if applicable)

If an architectural decision was made this session (a new library chosen, a pattern locked in, an approach rejected and why), add it to `.claude/DECISIONS.md` using this format:

```markdown
## ADR-NNN — Title

**Status:** Active

**Decision:** What was decided.

**Reasoning:** Why this choice was made.

**Trade-offs:** What was given up or deferred.
```

Use the next available ADR number. Never modify existing ADR entries — only mark them `[SUPERSEDED by ADR-NNN]` if replaced.

---

## Step 6 — Update MEMORY.md index

Read `MEMORY.md` again and add a line for any new memory file created in Step 3. Each line must be:

```
- [Title](filename.md) — one-line hook (under ~150 chars)
```

Do not duplicate existing entries. Do not remove existing entries unless a memory file was deleted.

---

## Step 7 — Output a summary

Report what was saved:

- List each memory file updated or created, with one sentence on what changed
- List any DECISIONS.md entry added
- Confirm project_state.md was updated
- If nothing warranted saving: say so explicitly — "No non-obvious, cross-session learnings found this session."
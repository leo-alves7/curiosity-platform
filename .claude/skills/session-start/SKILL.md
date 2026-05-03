---
name: session-start
description: Orientation skill run at the start of any session. Reads all memory, project vision, recent git history, and open branches, then outputs a structured briefing so no implementation begins in a vacuum.
allowed-tools: Read, Bash(git log:*), Bash(git branch:*), Bash(git status:*)
model: claude-haiku-4-5
---

You are running the **session-start** orientation skill. Your job is to produce a complete, structured briefing so the user and Claude can begin implementation or planning with full context. Do not implement anything. Do not ask questions. Just read, gather, and report.

---

## Step 1 — Read all memory files

1. Read `.claude/memory/MEMORY.md`
2. For every linked file in that index, read it now. Do not skip any.

---

## Step 2 — Read project vision

Read `.claude/PROJECT_VISION.md` in full.

---

## Step 3 — Read git state

Run these three commands:

```
git log --oneline -10
git branch -a | grep CSTY
git status
```

---

## Step 4 — Output the briefing

Write a structured briefing using exactly this format:

---

### Project State
What epics are complete, what is next on the roadmap, and what is the currently active epic (if any). Pull this from `project_state.md` and the PROJECT_VISION active epic section.

### Implementation Context
Key patterns to know before touching the codebase. Summarize from the architecture memory files:
- Backend layer rules (which layer owns what)
- Frontend Redux slice ownership (which slice owns which state)
- Icon rule
- Component directory rule

### Active Gotchas
List every item from `key_gotchas.md`. These are things that have tripped up past sessions and must not be forgotten.

### In-Progress Work
Based on `git branch -a | grep CSTY` and `git status`:
- Any open CSTY branches (list branch name + inferred ticket)
- Any uncommitted changes in the working tree
- If none: state "Working tree clean, no open CSTY branches"

### Critical Infrastructure Gaps
List the items that block major future epics but are not yet built:
- PostGIS (blocks all proximity/geospatial queries)
- Native Capacitor build (blocks App Store / Play Store submission)
- Error observability (no Sentry or equivalent yet)

### Recommendation
One or two sentences. Based on everything above: should the user start a new ticket, continue an in-progress branch, or address an infrastructure gap first? Be specific — name the ticket or gap.

---
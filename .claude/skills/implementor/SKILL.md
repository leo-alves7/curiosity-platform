---
name: implementor
description: Implement a Jira issue end-to-end using an agent team workflow — fetch context, plan with approval loop, implement, code-review loop, test loop, README update, incremental commits, PR, and a senior-engineer summary returned to the user.
allowed-tools: Skill, Read, Edit, Write, Glob, Grep, Bash(uv run pytest:*), Bash(npm run:*), Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*), Bash(git checkout -b:*), Bash(git branch:*), Bash(git push:*), Bash(gh pr create:*), TaskCreate, TaskUpdate, TaskList, TeamCreate, TeamDelete, SendMessage, Agent
model: claude-sonnet-4-6
---

You are the **implementor** — the team lead that takes a Jira issue all the way from description to an open pull request.

The Jira issue key is: `$0`

Use TaskCreate immediately to track progress through the phases below (one task per phase). Do not skip phases.

---

## Phase 1 — Gather Context

1. **Read `.claude/memory/MEMORY.md`** first, then read every file linked in the index. This gives you the full project brain — state, architecture, gotchas — before you read the ticket.
2. **Read `.claude/PROJECT_VISION.md`** — understand the product vision, active epic, two-tab architecture, user types, and any tech decisions that apply to this ticket. This prevents planning in a vacuum.
3. Use the `get-jira-issue` skill to fetch the full Jira issue details for `$0`.
4. Read the issue carefully: understand the acceptance criteria, scope, and any linked issues.
5. If you are not sure what to do, ask for clarification — this is the only time you will ask the user; after that, make decisions independently.
6. Use Glob and Grep to locate the files and modules most likely involved.
7. Use the Read tool to read those files. Understand the existing patterns, naming conventions, and abstractions before forming any opinion on the solution.
8. Write a one-paragraph summary of what needs to be built and which files are in scope. Include how this ticket fits into the broader product vision.

---

## Phase 2 — Planning Loop

Spawn a **Plan subagent** (`subagent_type: "Plan"`) with a detailed prompt that includes:

- The full Jira issue text
- Your one-paragraph summary from Phase 1
- The relevant file paths and any excerpts needed for context
- The instruction: "Produce a numbered, step-by-step implementation plan. Group steps into logical commits (e.g. 'Commit 1: base model and migration', 'Commit 2: failing tests for manager', 'Commit 3: manager implementation', 'Commit 4: frontend slice tests', 'Commit 5: frontend slice + hook'). For each step, name the exact file to change, what to change, and why. Apply TDD ordering: within each commit group, test commits must come before the source commits they test — the failing test defines the contract, the implementation satisfies it. Exempt from TDD ordering: Alembic migrations, Capacitor build config, third-party SDK initialization (Sentry, Firebase Analytics, Stripe setup), and UI-only React components. Apply the decomposition rule: no file should exceed ~300 lines — if a module would grow beyond that, split it into focused sub-modules."

After the Plan agent returns its plan, **review it yourself** against these criteria:

- Does it address every acceptance criterion in the Jira issue?
- Does it identify all files that must change (including tests)?
- Is the approach consistent with existing patterns you observed?
- Are the steps atomic enough to implement and verify independently?
- Are the commit groups logical and independently meaningful?
- Does the plan respect the decomposition rule (no file > ~300 lines, split when needed)?
- Would it introduce no regressions in unrelated code?

**If the plan is NOT good**, spawn a new Plan subagent. Include the previous plan, your specific objections, and what must be corrected. Repeat until the plan passes all criteria (max 3 iterations — if still failing, stop and explain why to the user).

**Once the plan is approved**, extract the commit groups from the plan — you will use them in Phase 7.

---

## Phase 3 — Implementation

1. Create a branch: `$0-short-description` (kebab-case). Check out this branch before any code changes.
2. Create a team: `TeamCreate` with name `implementor-$0`.
3. Spawn a **coder teammate** (`subagent_type: "general-purpose"`) using sonnet as the model with a prompt that includes:
   - The full approved plan (copy it verbatim)
   - The Jira issue context
   - All relevant file contents that must be modified
   - Instructions:
     - Use `Edit` for modifying existing files, `Write` only for genuinely new files
     - Follow the existing code patterns exactly — naming, imports, error handling
     - Never add imports inside functions or conditionals — only at the top of the file
     - Backend handlers must be `async def` and named `handle_*`
     - Business logic goes in managers, not routers
     - **Decomposition rule**: keep files focused and under ~300 lines. If a module grows beyond that, split it — e.g. a large router becomes `stores_router.py` + `store_validators.py`; a large component becomes multiple sub-components in their own files. Never create a monolithic file when the logic naturally separates. Apply this judgment during implementation, not as a post-step refactor.
     - **TDD workflow**: for backend managers, API handlers, and schemas with validation logic; and for frontend Redux slice reducers/selectors, custom hooks, and pure utility functions — write the test file first (it will fail), then implement the minimum code to make it pass, then refactor. Commit the failing test before the source it tests. Skip TDD for: Alembic migrations, Capacitor native config, third-party SDK init (Sentry, Firebase Analytics, Stripe), and React UI component layout.
     - After all changes are made, send a message back to the team lead listing every file changed, grouped by the commit groups from the plan

Wait for the coder teammate to message you with the grouped file list before proceeding.

---

## Phase 4 — Code Review Loop

1. Use the `code-reviewer` skill to review all changes.
2. If the verdict is **`REQUEST CHANGES`**:
   - Send the coder teammate a message with the exact issues listed in the review, referencing file paths and line numbers.
   - Wait for the coder to message you confirming the fixes are done.
   - Re-run the `code-reviewer` skill.
   - Repeat until the verdict is **`APPROVE`** (max 3 iterations — if still failing, stop and explain the remaining issues to the user).
3. Once approved, proceed to Phase 5.

---

## Phase 5 — Test Loop

Run the relevant tests based on what changed:

- **Python / backend changes:**

  ```
  uv run pytest tests/unit/ -n auto -x
  ```

  If you know specific test paths, run those first for speed.

- **Frontend changes:**
  ```
  cd webapp && npm run test:run
  ```

If tests **fail**:

- Send the coder teammate the full test failure output and the paths of both the failing tests and the source files under test.
- Wait for the coder to message you confirming the fixes.
- Re-run the tests.
- Repeat until all tests pass.

Once all tests pass, proceed to Phase 6.

---

## Phase 6 — Update README

Before committing, update `README.md` to reflect any changes introduced by this ticket. This is **mandatory** — do not skip it.

Read the current `README.md` and update it so it always reflects the true state of the project. Consider what changed and update accordingly:

- **New services or dependencies**: add them to the Prerequisites section and the Docker Compose services table
- **New environment variables**: add them to any `.env` / config reference section
- **New or changed commands**: update the Getting Started or dev commands sections (backend, frontend, Docker)
- **New API endpoints**: add them to the API Design section
- **New architecture concepts or modules**: update the Project Structure or Tech Stack sections
- **Anything a developer would need to know to run the project locally after this change**

Rules:
- Only update sections that are actually affected by this ticket — do not rewrite unrelated content
- Keep the README accurate and concise — no speculative or forward-looking content
- If a section doesn't exist yet but is now needed (e.g. Environment Variables), add it

---

## Phase 7 — Incremental Commits

Use the `format-code` skill first to format all changed files.

Then create one commit per logical group from the approved plan. For each group:

1. Stage only the files belonging to that group: `git add <file1> <file2> ...`
2. Commit with the message format: `$0 - <short description of this group>`

Example sequence for a store API ticket:
```
git add backend/curiosity/common/model/base.py backend/curiosity/web/model/store.py
git commit -m "CSTY-6 - store ORM model and base migration"

git add backend/curiosity/common/alembic/versions/...
git commit -m "CSTY-6 - alembic migration for store table"

git add backend/curiosity/web/managers/store_manager.py backend/curiosity/web/routers/stores_router.py
git commit -m "CSTY-6 - store manager and CRUD router"

git add tests/unit/web/test_store_manager.py
git commit -m "CSTY-6 - unit tests for store manager"
```

Never batch all changes into a single commit. Each commit must be independently meaningful and tell a clear story in `git log`.

---

## Phase 8 — Open PR

Push the branch and open a **draft** pull request:

```
git push -u origin <branch>
gh pr create --draft --title "$0 - <short description>" --body "<body>"
```

The PR body must follow this structure:
```
## What
<1-2 sentences on what was built>

## How
<bullet points on the technical approach — architecture decisions, patterns used, why>

## Testing
<how to test this manually and what automated tests were added>
```

After creating the PR, close the Jira ticket:

```bash
acli jira workitem edit $0 --status "Done" || echo "[CSTY] Warning: could not transition $0 to Done — verify the status manually on Jira"
```

If the status transition name in the project workflow differs (e.g. "Resolved", "In Review"), the command fails silently — the `||` keeps this non-blocking.

## Phase 9 — Cleanup

1. Shut down the coder teammate by sending a `shutdown_request` message and waiting for confirmation.
2. Call `TeamDelete` to remove the team and its task list.

---

## Phase 9.5 — Save Session State to Memory

**This step is mandatory and must not be skipped.**

Before writing the session summary, update memory:

1. Read `.claude/memory/project_state.md`
2. Update it: mark the ticket as complete, add what was implemented, add any implementation-level details future sessions should know (new patterns, gotchas, trade-offs made).
3. If a new architectural pattern was introduced (new Redux slice, new service, new hook pattern, new backend layer), update the relevant architecture memory file (`.claude/memory/architecture_frontend.md` or `.claude/memory/architecture_backend.md`).
4. Read `.claude/memory/MEMORY.md` and update the index if new memory files were created.

---

## Phase 10 — Session Summary

This is the final output you return to the user in the main session. Write it as a senior engineer handing off to a colleague. Two blocks only — Implementation Summary and Next Steps. Output each in its own markdown block so the user can copy-paste.

### Block 1 — Implementation Summary
What was actually built and with what approach. Cover:
- Key architectural decisions made and why
- How the code is structured (which files do what)
- Any non-obvious patterns or trade-offs applied
- What the decomposition looked like (how files were split and why)

### Block 2 — Next Steps & Possible Side Tickets
Think as a senior engineer reviewing the PR. Cover:
- Immediate follow-up work needed before this feature is production-ready (hardening, edge cases, missing pieces)
- Suggested new tickets with a one-line scope for each (use the CSTY prefix)
- Any technical debt introduced and when it should be addressed
- Dependencies or blockers for downstream tickets

---

## Phase 10.5 — Save Epic Seeds

**This step is mandatory and must not be skipped. Run it after Phase 10, before the session ends.**

Save Block 2 verbatim to the epic seeds memory file so the `/epic-seeds` skill can use it to plan future epics.

1. Read `.claude/memory/MEMORY.md` to check whether `epic_seeds.md` is already indexed.

2. **If `epic_seeds.md` does NOT exist yet** — create `.claude/memory/epic_seeds.md` with this exact header, then your entry:

```markdown
---
name: Epic Seeds — Recommended Next Steps by Session
description: Collected "next steps and possible side tickets" from completed ticket sessions. Fed into /epic-seeds for future epic planning.
type: project
---
```

   Then add one line to `.claude/memory/MEMORY.md`:
   ```
   - [Epic Seeds — Next Steps by Session](epic_seeds.md) — Block 3 from each completed ticket; reviewed by /epic-seeds to seed future epics
   ```

3. **If `epic_seeds.md` already exists** — open it and append to the end (after the last `---` separator).

4. In both cases, append this entry to `epic_seeds.md`:

```markdown
## $0 — <ticket title> (completed <today's date>, Epic: <epic name and CSTY epic key>)

<copy Block 3 verbatim here>

---
```

Do not modify existing entries. Never summarize or paraphrase Block 3 — copy it exactly as written. Each session is a permanent record.

---

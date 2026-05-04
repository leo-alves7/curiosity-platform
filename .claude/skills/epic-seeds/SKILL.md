---
name: epic-seeds
description: Senior-engineer review of accumulated "next steps and possible side tickets" from completed sessions. Verifies each recommendation against full project context and web research, presents verdicts to user for approval/denial/argument, then generates ready-to-paste session prompts that seed future epics — one prompt per approved epic.
allowed-tools: Read, Write, Edit, WebSearch, Bash(git log:*), Bash(git branch:*)
model: claude-sonnet-4-6
---

You are running the **epic-seeds** skill. Your job is to close the loop on a completed epic: take the accumulated "next steps and possible side tickets" recommendations from past sessions, filter them through senior-engineer judgment backed by web research, present your analysis to the user for approval, and generate self-contained session prompts that seed the next generation of epics.

This skill does NOT implement anything. It does NOT create Jira tickets. It produces planning artifacts — one markdown prompt block per approved epic — for the user to paste into a new Claude Code session.

Think of this as the tree dropping seeds: the completed work fertilizes the ground, you choose which seeds are viable, and you hand the user a ready-to-plant packet.

---

## Step 1 — Load all context

Read the following files in parallel. Do not skip any:

1. `.claude/memory/epic_seeds.md` — the raw seed recommendations from past sessions
2. `.claude/memory/project_state.md` — which epics are complete, which are defined, which are in-flight
3. `.claude/memory/project_vision_summary.md` — what Curiosity is and who it's for
4. `.claude/memory/architecture_frontend.md` — frontend architecture, Redux slices, patterns
5. `.claude/memory/architecture_backend.md` — backend layers, endpoint checklist, naming rules
6. `.claude/memory/key_gotchas.md` — known sharp edges that affect future planning
7. `.claude/PROJECT_VISION.md` — full product vision, epic tracking table, technology decisions
8. `README.md` — current documented state

Also run:
```
git log --oneline -20
git branch -a | grep CSTY
```

---

## Step 2 — Identify unprocessed seeds

In `epic_seeds.md`, find every section that does **not** have a `_Processed by /epic-seeds_` marker at the end. These are the seeds to review.

If all seeds are already processed, tell the user: "All seeds have been reviewed. No new recommendations to process." and stop.

If seeds are found, list the tickets they came from (e.g. "Found seeds from CSTY-33, CSTY-35") before continuing.

---

## Step 3 — Research context with WebSearch

For each distinct technology, pattern, or capability mentioned in the unprocessed seeds, do a targeted WebSearch to understand:

- Current best practices and maturity level (is this well-understood or still evolving?)
- Typical integration complexity with the Curiosity stack (Ionic React, FastAPI, Firebase, Capacitor, MapLibre)
- Common failure modes or gotchas that would affect the implementation estimate
- Whether any mentioned library has a better modern alternative

**Do not search for basics the project already uses** (React, FastAPI, Firebase Auth, MapLibre, Ionic). Only search for things that are new to the stack or non-obvious in practice.

Run searches in parallel where possible. Note the findings — they will inform your verdicts.

---

## Step 4 — Analyze each recommendation as a senior engineer

For every recommendation in the unprocessed seeds, apply these judgment criteria:

1. **Vision alignment** — does this serve the core product vision (store discovery, mobile-first, real users finding places)? Or is it infrastructure for its own sake?
2. **User impact** — would a real user notice or benefit from this? Is it a reliability, discovery, or engagement improvement?
3. **Technical soundness** — given the architecture (see memory files), is the approach correct? Would it introduce coupling, duplication, or violate existing layer rules?
4. **Sequencing** — are the dependencies met? Is there a blocking epic (e.g. PostGIS must land before proximity-based features)? Does it duplicate a story already in the backlog?
5. **Premature complexity** — is this solving a real problem that exists today, or speculative optimization for a scale/use-case that doesn't exist yet?
6. **Effort vs. value** — is this a quick side ticket (1-2 days), a full story (3-5 days), or a new epic (1-2 weeks)? Is the value proportionate?

Assign one verdict per recommendation:

- **RECOMMEND** — worth building; include in a new epic or as a standalone story
- **DEFER** — sound idea but premature or dependencies not met yet; specify the unblocking condition
- **REJECT** — misaligned with vision, duplicate of existing work, speculative complexity, or cost exceeds value

---

## Step 5 — Group recommendations into proposed epics

After assigning verdicts, group the RECOMMEND items into coherent epic proposals. Multiple epics may emerge from a single seed session. Use these grouping principles:

- Group by feature area (e.g. "analytics depth" items together, "abuse prevention" items together)
- Respect the natural sequencing from PROJECT_VISION.md — don't jump ahead of infrastructure epics
- If a recommendation is a standalone story that clearly belongs under a defined future epic (e.g. a CSTY-34 story), note that instead of creating a new epic for it

For each proposed epic:
- Give it a title and one-sentence scope
- List the stories it contains (each with a working title and brief scope)
- Note the natural story order and any internal dependencies
- Note which existing epic it follows (e.g. "follows Epic 4: Observability")

---

## Step 6 — Present analysis to user

Output the full analysis in this format:

```
## Epic Seeds Analysis

### Seeds reviewed from: [ticket list, e.g. CSTY-33, CSTY-35]

---

#### Recommendation: [exact recommendation text]
**Verdict:** RECOMMEND / DEFER / REJECT
**Rationale:** [1-2 sentences. If DEFER: state the condition. If REJECT: state why not.]
**Web research finding:** [key thing you learned from search, if applicable. Omit if no search was needed.]

---

[repeat for each recommendation]

---

### Proposed Epics

**Epic A: [Title]**
Stories: [story 1], [story 2], [story 3]
Follows: [Epic N — Title]
Scope: [1 sentence]

**Epic B: [Title]** (if applicable)
...

---

### DEFER list
- [recommendation] — unblocks when: [condition]

### REJECT list
- [recommendation] — reason: [reason]
```

After outputting this, **pause and wait for the user to respond**. The user may:
- Accept your verdicts as-is
- Override REJECT → RECOMMEND or DEFER → RECOMMEND (and give their reasoning)
- Remove items they don't want included
- Adjust groupings between proposed epics
- Ask you to reconsider a specific item

Incorporate any changes the user requests before proceeding to Step 7.

---

## Step 7 — Generate session prompts

For each approved epic, generate one self-contained session prompt. This prompt is what the user will **paste as the opening message in a brand-new Claude Code session** — the receiving session has zero context from this conversation.

Each session prompt must include:

1. **Epic title and one-sentence vision** — what is this epic about and why does it matter?
2. **Completion criteria** — how do you know the epic is done?
3. **Stories** — each with:
   - Working title
   - Scope (what it builds, not how)
   - Acceptance criteria (bullet list, testable)
   - Suggested CSTY ticket number (use next available numbers after current highest)
4. **Implementation order** — which story goes first and why (dependencies, risk)
5. **Context carried forward from seeds** — technical notes, patterns, gotchas, or decisions from the seeding session that the new session must know before touching code
6. **Dependencies** — which existing epic or ticket must be merged before this can start
7. **Instructions for the new session**:
   - Step 1: Run `/session-start` for orientation
   - Step 2: Create the Jira epic and story tickets (use MCP tools: `mcp__jira__jira_create_issue`)
   - Step 3: Implement each story in order using `/implementor CSTY-XX`
   - Step 4: After all stories complete, run `/epic-seeds` to seed the next generation

Wrap each prompt in a fenced block so the user can copy it cleanly:

````
## Session Prompt — Epic: [Title]

[full prompt content here]
````

If multiple epics were approved, output one block per epic, separated clearly.

---

## Step 8 — Mark seeds as processed

After outputting the session prompts, update `.claude/memory/epic_seeds.md`. Append a processing marker to the end of each section that was reviewed in this run:

```markdown
_Processed by /epic-seeds on <today's date>. Outcome: [e.g. "Epic 'Analytics Depth' seeded (3 stories). 2 items deferred. 1 rejected."]_
```

Do not modify the seed content above the marker — only append to the end of each reviewed section.

---

## Step 9 — Output a closing summary

After the prompts and markers are written, output a brief closing summary to the user:

- How many seeds were reviewed
- How many RECOMMEND / DEFER / REJECT verdicts were assigned
- How many new epics were seeded
- What the user should do next ("paste the session prompt above into a new Claude Code session to begin planning Epic X")
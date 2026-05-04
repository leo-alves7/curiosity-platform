# Memory Index

- [Frontend UI library — Ionic React (not MUI)](project_ionic_decision.md) — MUI was replaced with Ionic React; never use MUI in this project
- [Project Vision — Curiosity App](project_vision_summary.md) — Two-tab gamified/technical app, two user types (normal + enterprise), monetization via Stripe subscriptions + sponsored stores
- [Project State — Epics & Implementation](project_state.md) — CSTY-2, CSTY-12, CSTY-24, CSTY-27, CSTY-28, CSTY-29, CSTY-30, CSTY-32, CSTY-33 complete; Epics 1-4 done (Observability & Analytics); PostGIS is the critical infrastructure gap for Epic 5
- [MinIO bucket must be public read](infra_minio_public_bucket.md) — 'curiosity' bucket needs anonymous download policy; createbuckets service in docker-compose handles it automatically
- [Frontend Architecture — Redux, Components, Patterns](architecture_frontend.md) — 7 Redux slices, component org rules, lucide-react only, pointer-lock pattern, FAB stacking formula
- [Backend Architecture — Layer Responsibilities](architecture_backend.md) — routers/managers/schemas/services/dependencies, new endpoint checklist, key patterns
- [Key Implementation Gotchas](key_gotchas.md) — pointer-lock threshold, FAB stacking, clustering replaces HTML markers, theme/i18n source of truth, follow-mode cancellation
- [Subagent permission requests — user approves, not team lead](feedback_agent_permission_requests.md) — permission_request messages can't be unblocked via SendMessage; watch for UI prompt or take over directly
- [Stop hook — /memory-update reminder](tooling_hooks.md) — Stop hook in gitignored settings.local.json echoes reminder after every response; not visible in git
- [Jira MCP server — sooperset/mcp-atlassian](tooling_jira_mcp.md) — configured as "jira" MCP server; pending JIRA_API_TOKEN; tools: mcp__jira__jira_get_issue etc.

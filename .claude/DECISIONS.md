# Architectural Decision Record

This file is a permanent log of architectural decisions made in Curiosity Platform. Add a new entry any time a significant technical choice is made. Never delete entries — mark superseded ones as `[SUPERSEDED by ADR-NNN]`.

---

## ADR-001 — MapLibre GL JS (not Google Maps / Leaflet)

**Status:** Active

**Decision:** Use MapLibre GL JS as the map rendering engine.

**Reasoning:** Open-source WebGL engine with no API key requirement and no usage-based billing. Strong community fork of Mapbox GL JS with full feature parity. WebGL rendering handles thousands of markers smoothly. Pairs with Threebox for 3D avatar work when that epic begins.

**Trade-offs:** Mapbox Directions API unavailable without a key — routing will use OSRM or Valhalla instead.

---

## ADR-002 — Ionic React (not MUI)

**Status:** Active

**Decision:** Use Ionic React as the primary UI component library. MUI is banned.

**Reasoning:** Mobile-first from the ground up. Ionic components have native-equivalent look and feel on iOS/Android via Capacitor. MUI is desktop-first with poor mobile UX. Ionic's CSS variable system integrates directly with dark mode (`ion-palette-dark`).

---

## ADR-003 — lucide-react for icons (not IonIcon / ionicons)

**Status:** Active (IonIcon migration pending — ticket T4)

**Decision:** Use `lucide-react` exclusively for all icons. `IonIcon` / `ionicons` are banned in new code.

**Reasoning:** lucide-react offers more icon variety and cleaner React integration than IonIcon. IonIcon has cross-platform rendering inconsistencies. Adopted organically as the de facto choice while building CSTY-12.

**Migration note:** Some legacy IonIcon usages remain from earlier work. Ticket T4 tracks the cleanup.

---

## ADR-004 — Hand-rolled localStorage persistence (not redux-persist)

**Status:** Active

**Decision:** `settingsSlice` and `uiSlice` read/write `localStorage` directly. No redux-persist.

**Reasoning:** Only two slices need persistence. redux-persist adds configuration overhead and migration complexity for minimal benefit at this scale. Revisit if more than 5 slices need persistence.

**Implementation:** `localStorage.getItem('settings.theme')` / `localStorage.setItem(...)` called directly in slice initialState and reducers.

---

## ADR-005 — OpenFreeMap as tile provider

**Status:** Active

**Decision:** Use OpenFreeMap (`https://tiles.openfreemap.org/styles/liberty`) for map tiles.

**Reasoning:** Free, no API key, production-ready, shows roads/buildings/labels. Light and dark style URLs configured via `VITE_MAPLIBRE_STYLE_URL_LIGHT` / `VITE_MAPLIBRE_STYLE_URL_DARK` env vars.

---

## ADR-006 — PostGIS deferred

**Status:** Active (deferred)

**Decision:** PostGIS extension not added yet. Plain PostgreSQL for all current queries.

**Reasoning:** No proximity-based features exist yet. Adding PostGIS before it is needed adds operational complexity. Must be added before any "stores near me" or geospatial proximity feature begins.

---

## ADR-007 — Firebase Auth

**Status:** Active

**Decision:** Use Firebase Auth for all user authentication (Google, Apple, email/password).

**Reasoning:** Consumer app requires Google/Apple SSO. Already in the Firebase ecosystem (FCM for push notifications). Firebase Admin SDK on the backend verifies RS256 ID tokens without a separate auth service.

---

## ADR-008 — MapLibre native GeoJSON cluster source (not HTML Marker instances)

**Status:** Active

**Decision:** Store markers are rendered via a MapLibre GeoJSON source with `cluster: true`, not individual `maplibregl.Marker` HTML instances.

**Reasoning:** HTML markers don't cluster natively and have poor performance at scale. MapLibre's GeoJSON source handles clustering, zoom-to-expand, and count badges with zero extra dependencies. Implemented in CSTY-21.

---

## ADR-009 — react-i18next for internationalization

**Status:** Active

**Decision:** Use `react-i18next` with locale JSON files (`en.json`, `pt-BR.json`).

**Reasoning:** Ecosystem standard, simple JSON locale files, easy language detection. Auto-detection uses `navigator.language` + IANA Brazil timezone list. Implemented in CSTY-20.

---

## ADR-010 — Jira MCP Server (sooperset/mcp-atlassian)

**Status:** Configured — pending API token setup

**Decision:** Configure `sooperset/mcp-atlassian` as an MCP server for all Jira operations in Claude Code. The `get-jira-issue` skill was updated to prefer the MCP tool (`mcp__jira__jira_get_issue`) with `acli` as fallback.

**Reasoning:** Evaluated 2026-05-02. Both the official Atlassian remote MCP server and `sooperset/mcp-atlassian` (72 tools) are fully bidirectional — fetch, create, update, status transition, and comment. Community server chosen over official because it runs locally via `uvx` with API token auth (same pattern as existing `acli`), avoiding OAuth setup.

**Trade-offs:** Requires an Atlassian API token (generate at https://id.atlassian.com/manage-profile/security/api-tokens). Skills fall back to `acli` until the token is set in `settings.local.json` under `mcpServers.jira.env.JIRA_API_TOKEN`.

---

## ADR-011 — Scheduled PROJECT_VISION.md sync: deferred

**Status:** Deferred

**Decision:** Do not create a remote scheduled agent for the weekly PROJECT_VISION.md feature-table sync.

**Reasoning:** Evaluated 2026-05-02. Claude Code's `/schedule` skill creates agents that run in Anthropic's cloud environment. These agents have no access to the local filesystem or local git repositories. The proposed sync requires `git log --since=7days` and reading/writing local files — impossible for a remote agent.

**Alternative:** Run the sync manually at session end via `/memory-update`, which already covers `project_state.md`. For fully automated sync, set up a local cron job: `0 9 * * 1 cd /path/to/project && claude --print "Read .claude/PROJECT_VISION.md and git log --since=7days --oneline. Update the feature table for any CSTY tickets that have been merged."`. Revisit if Claude Code adds local-aware cron scheduling.
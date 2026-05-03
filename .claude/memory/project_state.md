---
name: Project State — Active Epic
description: Current implementation state of Curiosity Platform and what epic is in progress
type: project
originSessionId: 52b396a5-4cd4-444e-b5ea-9ac6a3ab08c8
---
Epics 1–3 complete. Epic 4 (Observability & Analytics, CSTY-31) is next. TDD is now the standard implementation methodology (ADR-014, 2026-05-03).

**Why:** Tracking so future sessions don't re-plan already-done work.
**How to apply:** When asked what's been done or what's next, start from this state. Read `.claude/PROJECT_VISION.md` for full current-state table. Apply TDD rules on every new implementation session — see `.claude/rules/backend/testing.md` and `.claude/rules/frontend/testing.md`.

## TDD Standard (adopted 2026-05-03, ADR-014)

TDD applies to: backend managers/handlers/schemas, frontend Redux slices/hooks/utils.
TDD exempt: Alembic migrations, Capacitor config, SDK init (Sentry/Firebase Analytics/Stripe), React UI component layout.
Commit rule: test commit precedes source commit in every group.

## Completed Epics

- **Epic 3 — Core UX & Stability** (CSTY-27, CSTY-28, CSTY-29, CSTY-30 — all merged 2026-05-03):
  - CSTY-27: Map controls overhaul — corrected pan/rotate bindings, follow-mode cancellation, mobile touch
  - CSTY-28: Login page redesign + email/password registration flow
  - CSTY-29: Desktop layout overhaul — search in AppHeader, collapsible sidebar (uiSlice + localStorage)
  - CSTY-30: UI polish pass — 8px spacing grid, 16:9 store cards, typography hierarchy, empty states everywhere

- **CSTY-2** — Foundation & Infrastructure: FastAPI, PostgreSQL, Redis, Celery, Firebase Auth, admin role (custom claims), Store CRUD, Category CRUD, store image upload (MinIO), admin management UI.
- **CSTY-12** — UX Overhaul & Real-time Map Foundation (8 stories, all merged):
  - CSTY-13: OpenFreeMap tiles, pitch 45° default, custom pointer controls (left=rotate, right=pan) [FIXED by CSTY-27]
  - CSTY-15: GPS pulsing dot + accuracy circle, locate-me FAB, follow mode
  - CSTY-16: Bottom tab nav (IonTabs, /map + /explore), collapsible store panel (IonModal breakpoints)
  - CSTY-17: AppHeader, UserAvatar (photoURL or HSL-hashed initials), ProfileMenu (theme/language/logout)
  - CSTY-18: Add Store flow — FAB → crosshair → draggable pin → IonModal form → POST stores + image upload
  - CSTY-19: Dark mode — settingsSlice (light/dark/system), useTheme hook, ion-palette-dark, map style swap
  - CSTY-20: i18n — react-i18next, en.json + pt-BR.json, auto-detect via browser locale + 18 Brazil timezones
  - CSTY-21: Map clustering — GeoJSON source (cluster:true), 3 layers, color/size gradients, zoom-on-cluster-click
  - CSTY-22: Icons migration — all IonIcon usages replaced with lucide-react; ionicons fully removed from webapp/src

## Bugfix (2026-05-03) — CSTY-27: Map Controls Overhaul PR #33

**Fixed:** Inverted left/right mouse button behavior + missing follow-mode cancellation on scroll wheel.
- **Left-drag (M1)** now pans; **right-drag (M2)** now rotates (was inverted in CSTY-13)
- **Pointer lock** moved from left-drag to right-drag (rotation orbit only)
- **Follow-mode cancellation** now happens on any drag past threshold (4px), not on `pointerdown`; also cancels on scroll wheel
- **Mobile support** added: 1-finger touch pans, 2-finger gestures handled by MapLibre `touchZoomRotate`
- **Documentation** updated: `.claude/rules/frontend/ui-ux.md` (stale map binding rules) and README (follow-mode description)

## UX Feature (2026-05-03) — CSTY-28: Login Page Redesign + Email Registration PR #34

**Implemented:** Redesigned login page with centered card layout (max-width 420px) and email/password user registration.
- **LoginForm component** — new feature component at `webapp/src/features/auth/LoginForm.tsx` (163 lines); encapsulates sign-in and register modes in a single form with centered card layout using Ionic CSS variables (dark mode support).
- **Mode toggle** — sign-in and register modes toggle via "Don't have an account?" and "Already have an account?" links; form state (error, confirm password) cleared on mode switch.
- **Registration flow** — email + password + confirm-password fields. Client-side password mismatch validation prevents Firebase calls. New `createUserWithEmailAndPassword()` method added to `useAuth` hook; maps Firebase error codes: `auth/email-already-in-use` (email taken), `auth/weak-password`, `auth/invalid-email`.
- **Thin page wrapper** — `LoginPage.tsx` refactored from 107 lines (mixed logic) to 30 lines (route wrapper). Delegates form logic to `LoginForm`, maintains toolbar title sync with mode.
- **i18n** — 9 new English keys + Portuguese translations in both locale files. All user-facing strings use `t()` function.
- **Tests** — 12 new tests for `LoginForm` covering both modes, error states, Firebase error mapping, spinner display. 1 new test in `useAuth.test.ts` for `createUserWithEmailAndPassword`. All 303 tests pass.
- **README** — updated frontend auth section to document `createUserWithEmailAndPassword` and new `LoginForm` component.
- **5 commits** (i18n → useAuth → LoginForm+LoginPage → tests → README).

## UX Feature (2026-05-03) — CSTY-29: Desktop Layout Overhaul PR #35

**Implemented:** Moved search bar to AppHeader on desktop, added collapsible sidebar for desktop layout.
- **Redux state** — Added `isSidebarCollapsed` field to `uiSlice` with `toggleSidebar()` and `setSidebarCollapsed()` reducers; persisted to localStorage key `ui.isSidebarCollapsed` (default: false = expanded).
- **AppHeader enhancements** — Exported `AppHeaderProps` interface with optional props: `showSidebarToggle`, `isSidebarCollapsed`, `onToggleSidebar`, `searchQuery`, `onSearchChange`. On desktop: renders sidebar toggle button (`PanelLeftClose`/`PanelLeftOpen` icons) in header's `slot="start"` + replaces title with `IonSearchbar`. On mobile: keeps title + avatar (no sidebar toggle or search bar in header). Uses shared `useSearchDebounce` hook (moved from `features/stores/` to `hooks/`) for 300ms debounced search input.
- **Layout & interactions** — **MapPage (desktop):** animated CSS grid `gridTemplateColumns` transition from `'35fr 65fr'` to `'0fr 1fr'` (250ms ease); calls `mapInstance.resize()` after animation. **StoreListPanel:** search bar now behind `{isMobile && ...}` conditional — visible on mobile, hidden on desktop (search lives in AppHeader instead). **ExplorePage:** imports `useIsMobile` hook; conditionally passes search props to AppHeader on desktop; hides searchbar from panel on desktop.
- **Shared hook refactoring** — Created `webapp/src/hooks/useSearchDebounce.ts` (moved from `features/stores/`; now used by both `StoreListPanel` and `AppHeader`). Added comprehensive test coverage (5 tests: debounce delay, value changes, callback reference updates, unmount cleanup).
- **i18n** — Added 2 new keys (`storeList.collapseSidebar`, `storeList.expandSidebar`) to both en.json and pt-BR.json.
- **Tests** — Updated all test files to include `isSidebarCollapsed: false` in Redux preloaded state. Added tests for sidebar toggle button (render, icon changes, click handler) and search bar visibility (by layout mode: desktop/mobile). All 327 tests pass (5 new tests for useSearchDebounce hook).
- **README** — Updated AppHeader feature description to mention desktop search bar and sidebar toggle; updated Collapsible panel description to document desktop collapse animation and map.resize() behavior.
- **3 commits** (uiSlice → AppHeader+i18n+shared-hook → pages+panel+README); **code review:** 1 issue found (import path for shared hook) and fixed.

## Current Frontend State

**Redux slices (7):** auth, stores, map, location, ui, settings, admin. Persisted: `ui.isPanelOpen`, `settings.theme`, `settings.language` (manual localStorage, not redux-persist).

## Asset Pipeline (T6 session, CSTY-24, 2026-05-03)

- `@capacitor/assets` installed; `npm run generate:assets` generates all iOS/Android/PWA sizes from `webapp/resources/icon.png` (1024×1024) and `webapp/resources/splash.png` (2732×2732). Source files are placeholder PNGs — replace with final Figma designs before App Store submission.
- 6 SVG category markers in `webapp/src/assets/markers/` (`restaurant`, `pharmacy`, `gas_station`, `market`, `hotel`, `default`) with `index.ts` exporting `categoryMarkers` record. All 6 are **integrated** into the MapLibre `unclustered-point` symbol layer (CSTY-26, 2026-05-03).
- `lottie-react` installed; `EmptyState` shared component (`src/components/EmptyState/`) with optional `animationData` prop + lucide fallback. Wired into `StoreList` empty state with a pulsing magnifying-glass animation (`src/assets/animations/no-results.json`).
- jsdom canvas mock pattern established: `src/__mocks__/lottie-react.tsx` + `vite.config.ts` `test.alias`. See key_gotchas.md.

## Map Data Fix (CSTY-26, 2026-05-03) — PR #32

Three map bugs fixed:
1. **All stores on map**: `fetchStoresAndCategories` now calls `fetchAllStores()` (`GET /api/v1/stores?page_size=10000`) instead of the paginated `fetchStores()`. The list view still paginates client-side via `selectPaginatedFilteredStores`.
2. **Category SVG markers**: `unclustered-point` layer replaced from `circle` to `symbol` with `icon-image: coalesce(image(concat('category:', category_slug)), image('category:default'))`. GeoJSON features now carry `category_slug` (via optional `categorySlugMap` param on `storesToFeatureCollection`). Images pre-loaded by `useMapImageLoader` hook; re-registered on `styledata` event for dark/light theme switches.
3. **5 seeded categories**: Alembic migration `seed_categories` (`d2e54e5954c2`) inserts Restaurant, Pharmacy, Gas Station, Market, Hotel with hardcoded UUIDs using `ON CONFLICT (slug) DO NOTHING`.

## Epic 4 — Observability & Analytics (CSTY-31, created 2026-05-03)

Stories defined, not yet implemented:
- **CSTY-32** — Sentry integration: `@sentry/react` + `@sentry/vite-plugin` in webapp; `sentry-sdk` in FastAPI; DSN via env vars; no PII in payloads
- **CSTY-33** — Firebase Analytics: initialize `firebase/analytics` in `firebase.ts`; 7 core events; centralized `useAnalytics()` hook; disabled in dev mode; no PII in event params

**Why:** Cannot safely invite real users without crash reporting and usage visibility.
**How to apply:** When starting CSTY-32 or CSTY-33, check sentry.io project exists and Firebase Analytics is enabled in the Firebase console before coding.

## Epic 5 — PostGIS & Proximity Queries (CSTY-34, created 2026-05-03)

Stories defined, not yet implemented:
- **CSTY-35** — PostGIS infrastructure: `postgis/postgis:15-3.4` docker image, `CREATE EXTENSION postgis`, `geography(Point, 4326)` column on `stores`, backfill from lat/lng floats, GIST spatial index, `geoalchemy2` ORM column, `uv add geoalchemy2`
- **CSTY-36** — Nearby stores API: `GET /api/v1/stores/nearby?lat=X&lng=Y&radius_m=5000`, `distance_m` in response, `ST_DWithin` + `ST_Distance`, `StoreNearbyResponse` schema, `handle_get_nearby_stores` handler, unit tests
- **CSTY-37** — Frontend nearby mode: fetch nearby when GPS available, radius circle on map (MapLibre fill layer + turf.circle), distance on store cards and popups, fallback to all-stores when GPS unavailable, `nearbyMode` + `radiusM` in `storesSlice`, debounced on `locationSlice.userLocation`

**Why:** "Stores near me" is the core value proposition; all proximity features are blocked until PostGIS lands.
**How to apply:** Start with CSTY-35 (infrastructure), then CSTY-36 (API), then CSTY-37 (frontend) — hard sequential dependency.

## Epic 6 — Native App & Distribution (CSTY-38, created 2026-05-03)

Stories defined, not yet implemented:
- **CSTY-39** — Capacitor native build: iOS and Android projects via `npx cap sync`; app icon/splash from CSTY-24 pipeline; bundle ID in `capacitor.config.ts`; README updated
- **CSTY-40** — Push notifications (FCM): `@capacitor/push-notifications`; permission request on first launch; `POST /api/v1/notifications/send` (admin-only backend endpoint); "New store added near you" end-to-end; `google-services.json` / `GoogleService-Info.plist` never committed to git
- **CSTY-41** — Deep links: `https://[app-domain]/stores/:id`; iOS Associated Domains + Android App Links; `/.well-known/apple-app-site-association` on Cloudflare Workers; `@capacitor/share` in StoreDetailContent

**Why:** PWA alone cannot reach mainstream consumers — App Store/Play Store presence is required. FCM enables re-engagement. Deep links enable viral sharing.
**How to apply:** Start with CSTY-39 (build foundation), then CSTY-40 (FCM), then CSTY-41 (deep links). CSTY-40 requires `google-services.json` and `GoogleService-Info.plist` from Firebase — verify these exist locally before starting.

## Epic 7 — Enterprise Owner & Monetization (CSTY-42, created 2026-05-03)

Stories defined, not yet implemented:
- **CSTY-43** — Enterprise owner role + store claim flow: `role: "enterprise"` Firebase custom claim, "Claim this store" UI button, `POST /api/v1/stores/:id/claim`, `store_claims` table, admin review queue (approve/reject), Firebase custom claims set server-side, `owner_id` on `stores`, `users` table migration, "Manage my store" placeholder view
- **CSTY-44** — Stripe subscription plans: `uv add stripe`, `SubscriptionTier` enum (free/standard/premium), `subscription_tier` column on `stores`, `subscriptions` table, Stripe Checkout session endpoint, Stripe webhook endpoint (signature verified, excluded from Firebase auth), subscription management UI, `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` in `.env.example`
- **CSTY-45** — Sponsored store placement: `is_sponsored` + `sponsored_until` on `stores`, sponsored stores sorted first in all result sets, distinct SVG marker style on map (gold accent, MapLibre `sponsored-stores` layer), admin sponsor/unsponsor endpoints, expiry handled at query time

**Why:** Business model layer — monetization after real user base established (Epics 3–6 first).
**How to apply:** Implement in story order: CSTY-43 → CSTY-44 → CSTY-45. CSTY-43 must land first as it introduces `users` table and `enterprise` role that CSTY-44 depends on. CSTY-45 depends on CSTY-36 (nearby API from Epic 5) for the sponsored proximity sort.

## Critical Infrastructure Gap

**PostGIS** — needed for "stores near me". Must be added before any proximity-based feature. Epic 5 (CSTY-34) tracks this work.

## UI Polish (2026-05-03) — CSTY-30: UI Polish Pass PR #37

**Implemented:** Visual quality pass across all screens — spacing, typography, card design, empty states.
- **StoreCard**: 16:9 aspect ratio via `paddingBottom: '56.25%'` + absolute inner layer (replaced fixed `height: 120`); `fontWeight: 700` on `IonCardTitle`; `boxShadow: '0 2px 8px rgba(0,0,0,0.08)'` on `IonCard`
- **StoreListPanel**: header padding `12px 16px 0` → `16px 16px 0` (8px grid alignment)
- **StoreDetailContent**: store name `h2` now `fontSize: 20, fontWeight: 700`; share button `width: '100%'`
- **StorePopup**: padding `8px 4px` → `8px 12px`
- **StoreManagement**: fixed hardcoded `color: 'red'` → `<IonText color="danger">`; added `EmptyState` when `status === 'succeeded' && filtered.length === 0`
- **CategoryManagement**: added `EmptyState` when `categories.length === 0`; no `status` guard needed because `fetchAdminCategoriesThunk` doesn't update `state.status` (only stores thunk does — adminSlice design limitation)
- **i18n**: 4 new admin empty state keys in both `en.json` and `pt-BR.json`
- **4 commits**, **331 tests pass** (4 new tests)

## Session Workflow Tooling (T2 session, 2026-05-02)

Two skills and two rule files were created to enforce consistent session behavior:

- `/session-start` skill — run this at the start of every session before any implementation. Reads all memory, PROJECT_VISION.md, git log, open branches, and outputs a structured briefing.
- `/memory-update` skill — run this at the end of every session (for non-implementor sessions). Interactively reviews session changes and updates memory files, DECISIONS.md, and project_state.md.
- `.claude/rules/frontend/architecture.md` — enforces directory ownership, Redux slice ownership, icon rule, file size limit, and test coverage for `webapp/src/**`.
- `.claude/rules/backend/architecture.md` — enforces layer responsibilities, new-endpoint checklist, naming conventions, and test coverage for `backend/curiosity/**`.

**Why:** Prevents sessions from starting without context and prevents memory from drifting.
**How to apply:** At session start, run `/session-start`. At session end (if not using implementor), run `/memory-update`. The implementor skill has Phase 9.5 which covers the same end-of-session memory update for implementation sessions.

## Automation & Hooks (T3 session, 2026-05-02)

Three tooling improvements added (all in `.claude/` — not product features):

- **Stop hook** — `.claude/settings.local.json` now has a `Stop` hook that echoes a `/memory-update` reminder after every response. File is gitignored; see `tooling_hooks.md` memory.
- **Jira MCP** — `sooperset/mcp-atlassian` configured as MCP server `jira`. Config lives in `.mcp.json` at project root (gitignored, contains API token). `mcpServers` in `settings.local.json` is invalid in v2.x and was silently ignored — fixed 2026-05-03. `settings.local.json` has `enableAllProjectMcpServers: true`. See `tooling_jira_mcp.md` and ADR-010.
- **Implementor Phase 8** — Now runs `acli jira workitem transition --key $0 --status "Done" --yes` (non-blocking) after creating the PR. Note: correct command is `transition`, NOT `edit --status` (edit does not support `--status`).
- **Scheduled sync** — Evaluated and deferred. Remote agents can't access local git. See ADR-011 in DECISIONS.md.
- **get-jira-issue skill** — Updated to prefer `mcp__jira__jira_get_issue` with `acli` fallback.

## Jira Auth

`acli` is authenticated to `curiosity-platform.atlassian.net`. Run `acli jira auth switch --site curiosity-platform.atlassian.net` if it reverts.

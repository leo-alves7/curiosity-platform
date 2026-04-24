# Curiosity Platform — Project Vision & Roadmap

## What is Curiosity?

Curiosity is a **mobile-first, real-time store discovery platform** — think Google Maps + TripAdvisor + Waze, but laser-focused on helping people find and explore stores and points of interest nearby. The goal is to surface places people have never been to but are curious about: what's inside, what does it sell, how is the food, what do people think of it.

The app is community-powered: any user can add a store they found. Store owners (enterprises) can claim and enrich their listing with catalogues, prices, photos, videos, and promotional visibility.

---

## Two User Types

### Normal User (easy access)
- Browse the map and discover nearby stores
- Filter by category (restaurant, pharmacy, gas station, market, hotel, etc.)
- Add a new store they find (drop pin, set category, name, photo)
- Mark/report incorrect or spam places (with abuse-prevention limits)
- Browse the store explorer tab (iFOOD-like list view)
- Future: Customizable profile avatar (Pokémon GO-style) walking on the map

### Enterprise Owner (store owner)
- All normal user capabilities
- Claim ownership of a store listing
- Enrich the listing: catalogue, prices, photos, interior tour video, business hours, contact info
- Access analytics for their store (views, clicks, engagement)
- Subscription plans — higher tier = more features unlocked:
  - Free: basic listing
  - Standard: catalogue + photos + contact
  - Premium: all above + video tours + analytics
  - Sponsored: promotional placement on map (boosted visibility, priority in category filters, special push notifications to nearby users)

---

## Two Main Tabs

### Tab 1 — Navigation Map (real-time, gamified)
- Interactive map showing stores near the user in real time
- Category filter chips at top (Restaurants, Pharmacies, Gas Stations…)
- Marker icons per store, clustered when zoomed out
- Tapping a marker opens a quick card (store name, category, cover image, distance)
- "View details" navigates to the store detail view
- Waze-like road tracking / routing to guide user to a store
- **Gamified visual style**: pitch 45° 3D by default, bright cartoon-like map theme, eventually 3D walking avatar (Threebox + Three.js)
- Left-drag = rotate around user's position (locked center); right-drag = pan freely
- Sponsored stores appear higher, with a distinct marker style

### Tab 2 — Store Explorer (browse, technical/clean)
- iFOOD-style scrollable list of stores
- Search bar with debounced name search
- Category filter tabs / horizontal scroll chips
- Store cards with cover image, name, category, rating, distance
- Tapping a card opens the full store detail view (catalogue, photos, videos, reviews)

---

## Store Detail View
- Cover image / gallery / interior video
- Name, category chip, distance, address
- Owner info + hours
- Catalogue (items, prices)
- Reviews & ratings (future)
- "Get Directions" button → launches navigation on Tab 1
- Share link (native Capacitor Share)

---

## Monetization
- Enterprise subscription plans (Stripe)
- Sponsored store placement (per-store boost, billed separately or as addon)
- Future: in-app premium features for normal users

---

## Mobile-First Strategy
- Built with Ionic React + Capacitor → ships as native iOS/Android app
- Also works as a PWA in the browser (Cloudflare Workers)
- All UI is mobile-first; desktop is secondary
- Push notifications via Firebase Cloud Messaging (FCM)
- Native device features: GPS, camera (photo upload), share

---

## Current Implementation State (end of Epic CSTY-2)

| Feature | Status |
|---|---|
| FastAPI backend, PostgreSQL, Redis, Celery | ✅ Done |
| Alembic migrations + Base model (UUID, soft delete) | ✅ Done |
| Firebase Auth (Google, Apple, email/password) | ✅ Done |
| Admin role check (Firebase custom claims) | ✅ Done |
| Store CRUD API | ✅ Done |
| Category CRUD API | ✅ Done |
| Store image upload (MinIO) | ✅ Done |
| Admin management UI (store + category) | ✅ Done |
| Interactive map (MapLibre) with store markers | ✅ Done |
| Store list sidebar with search + filter | ✅ Done |
| Store detail view (modal + direct URL) | ✅ Done |
| Cloudflare Workers frontend deployment | ✅ Done |
| Geospatial queries (PostGIS) | ❌ Not started |
| Real-time location / WebSockets | ❌ Not started |
| Turn-by-turn navigation / routing engine | ❌ Not started |
| Push notifications (FCM) | ❌ Not started |
| Enterprise owner role + store claim flow | ❌ Not started |
| Subscription plans (Stripe) | ❌ Not started |
| Sponsored store system | ❌ Not started |
| Store catalogue (items + prices) | ❌ Not started |
| Video uploads | ❌ Not started |
| Reviews & ratings | ❌ Not started |
| User profiles | ❌ Not started |
| Map marker clustering | ❌ Not started |
| Community store add (normal user flow) | ❌ Not started |

---

## Technology Decisions

- **MapLibre GL JS** — keep; solid open-source WebGL rendering engine. Pair with OSRM or Valhalla for routing. Add Threebox when 3D avatar work begins.
- **PostGIS** — must add; required for efficient "nearby stores" geospatial queries. Critical gap.
- **Ionic React + Capacitor** — keep; perfect for mobile-first cross-platform (iOS/Android/PWA).
- **Stripe** — add when subscription/payment work begins.
- **FCM** — add when push notification work begins (already using Firebase ecosystem).
- **Cloudflare R2** — evaluate as replacement for MinIO in production (native CDN, cheaper egress, same S3 API).
- **react-i18next** — chosen i18n library; EN default, PT-BR supported.
- **OpenFreeMap** — chosen tile provider for map style (free, no API key, production-ready).

---

## Epic Tracking

| Epic | Title | Status |
|---|---|---|
| CSTY-2 | Foundation & Infrastructure | ✅ Complete |
| Next (UX Overhaul) | UX Overhaul & Real-time Map Foundation | 🔜 In planning |

---

## Upcoming Epic — UX Overhaul & Real-time Map Foundation

**Goal:** Make the app feel like a real product on mobile. Fix all critical UX gaps on the navigation map, establish the dark/light theme and i18n systems that every future epic will depend on.

### Stories (recommended implementation order)

#### 1. Map Tile Style + 3D Defaults + Control Swap
The current tile source (demotiles) shows only flat country colors — no roads, no buildings, no terrain.
- Replace tile style with **OpenFreeMap** (`https://tiles.openfreemap.org/styles/liberty`) — shows roads, buildings, labels
- Add a **dark map style URL** used when dark mode is active
- Set default `pitch: 45` and `bearing: 0` — 3D perspective by default
- Swap mouse controls: **left-drag = rotate** (locked center, camera orbits), **right-drag = pan** (free movement)
- New env vars: `VITE_MAPLIBRE_STYLE_URL_LIGHT`, `VITE_MAPLIBRE_STYLE_URL_DARK`

#### 2. GPS User Location Indicator
Core to the mobile-first real-time vision — user must see themselves on the map.
- "Locate me" FAB button (bottom-right of map canvas)
- Animated pulsing dot at user's real-time GPS position (`navigator.geolocation.watchPosition`)
- Accuracy circle around the dot (scaled to GPS accuracy radius)
- Map auto-centers on user when the tab is first opened
- **Button highlights** when the viewport has panned away from the user's position
- Redux slice tracks `userLocation` + `isFollowingUser` flag

#### 3. Collapsible Store Panel + Bottom Tab Navigation
The left panel currently cannot be closed. Mobile layout must use bottom tabs, not a persistent sidebar.
- Collapse/toggle button on the store list panel with slide animation
- Panel state (`isOpen: boolean`) stored in Redux, persisted
- Add proper **bottom tab bar** (Ionic `IonTabs`): Tab 1 = Navigation Map (`/map`), Tab 2 = Store Explorer (`/explore`)
- On desktop, sidebar behavior can remain; on mobile, full-screen map with bottom tabs

#### 4. User Header + Profile Menu + Logout
No way to logout or see profile after login.
- Persistent header/toolbar: user avatar (Firebase `photoURL`, fallback to initials) + menu icon
- Profile popover/sheet: display name, email, language selector, theme toggle, logout
- Logout calls Firebase `signOut()` and clears Redux auth state

#### 5. Add Store Quick-Action Flow
No way to add a store from the UI.
- FAB on the map canvas (above locate-me button) — "+" icon
- "Add mode": user taps/clicks to drop a pin on the map
- Bottom sheet slides up with form: name, category (dropdown), optional photo upload
- On submit: `POST /api/v1/stores` with lat/lng from dropped pin, confirmation toast

#### 6. Dark Mode (Light Default)
- Ionic dark palette toggle (`ion-palette-dark` class on `<html>`)
- System preference auto-detection (`prefers-color-scheme: dark`) on first load
- Manual toggle in profile menu; preference persisted in Redux + `localStorage`
- Map tile style swaps to dark URL when dark mode is active
- Settings: `{ theme: 'light' | 'dark' | 'system' }`

#### 7. Internationalization — EN + PT-BR
- Add `react-i18next` with locale JSON files (`webapp/src/locales/en.json`, `pt-BR.json`)
- Supported locales: `en` (default) and `pt-BR`
- Auto-detect: browser locale first; if timezone/locale indicates Brazil, switch to `pt-BR`
- Show a dismissable toast on auto-switch: "Idioma alterado para Português (BR)"
- Language preference stored in Redux; overrides auto-detection after first manual change
- All existing UI strings extracted to locale files

#### 8. Map Marker Clustering
Dense urban areas will have hundreds of overlapping markers.
- Use MapLibre's built-in GeoJSON cluster source (`cluster: true`, `clusterMaxZoom`, `clusterRadius`)
- Cluster circles show store count badge; color scales with count
- Clicking a cluster zooms in to expand it
- Individual store markers appear only past cluster threshold

### Key Tech Decisions for This Epic
- **Map tile provider**: OpenFreeMap — free, no API key, production-ready
- **i18n library**: `react-i18next` — ecosystem standard, simple JSON locale files
- **Dark mode**: Ionic CSS variables + `ion-palette-dark` — no extra library
- **Geolocation**: native `navigator.geolocation.watchPosition` — no extra library
- **Clustering**: MapLibre built-in cluster source — zero extra dependencies
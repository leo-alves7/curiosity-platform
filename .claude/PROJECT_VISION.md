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

## Current Implementation State

| Feature | Status | Ticket |
|---|---|---|
| FastAPI backend, PostgreSQL, Redis, Celery | ✅ Done | CSTY-2 |
| Alembic migrations + Base model (UUID, soft delete) | ✅ Done | CSTY-2 |
| Firebase Auth (Google, Apple, email/password) | ✅ Done | CSTY-2 |
| Admin role check (Firebase custom claims) | ✅ Done | CSTY-2 |
| Store CRUD API | ✅ Done | CSTY-2 |
| Category CRUD API | ✅ Done | CSTY-2 |
| Store image upload (MinIO) | ✅ Done | CSTY-2 |
| Admin management UI (store + category) | ✅ Done | CSTY-2 |
| Interactive map (MapLibre) with store markers | ✅ Done | CSTY-2 |
| Store list sidebar with search + filter | ✅ Done | CSTY-2 |
| Store detail view (modal + direct URL) | ✅ Done | CSTY-2 |
| Cloudflare Workers frontend deployment | ✅ Done | CSTY-2 |
| Map tile style (OpenFreeMap) + 3D pitch 45° + custom mouse controls | ✅ Done | CSTY-13 |
| GPS user location (pulsing dot, accuracy ring, follow mode, Locate Me FAB) | ✅ Done | CSTY-15 |
| Collapsible store panel + bottom tab navigation (mobile IonTabs) | ✅ Done | CSTY-16 |
| User header + profile menu + logout (AppHeader, UserAvatar, ProfileMenu) | ✅ Done | CSTY-17 |
| Community store add flow (Add Store FAB, pin drop, bottom sheet form) | ✅ Done | CSTY-18 |
| Dark mode (light default, system detection, manual toggle) | ✅ Done | CSTY-19 |
| Internationalization (EN + PT-BR) | ✅ Done | CSTY-20 |
| Map marker clustering | ✅ Done | CSTY-21 |
| Geospatial queries (PostGIS) | ❌ Not started | — |
| Real-time location / WebSockets | ❌ Not started | — |
| Turn-by-turn navigation / routing engine | ❌ Not started | — |
| Push notifications (FCM) | ❌ Not started | — |
| Enterprise owner role + store claim flow | ❌ Not started | — |
| Subscription plans (Stripe) | ❌ Not started | — |
| Sponsored store system | ❌ Not started | — |
| Store catalogue (items + prices) | ❌ Not started | — |
| Video uploads | ❌ Not started | — |
| Reviews & ratings | ❌ Not started | — |
| User profiles | ❌ Not started | — |

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

| Epic | Jira | Title | Status |
|---|---|---|---|
| Epic 1 | CSTY-2 | Foundation & Infrastructure | ✅ Complete |
| Epic 2 | CSTY-12 | UX Overhaul & Real-time Map Foundation | ✅ Complete |
| Epic 3 | — | Core UX & Stability | ✅ Complete (CSTY-27, CSTY-28, CSTY-29, CSTY-30) |
| Epic 4 | CSTY-31 | Observability & Analytics | 🔜 Next |
| Epic 5 | CSTY-34 | PostGIS & Proximity | ⬜ Defined |
| Epic 6 | CSTY-38 | Native App & Distribution | ⬜ Defined |
| Epic 7 | CSTY-42 | Enterprise & Monetization | ⬜ Defined |

### Epic 3 — Core UX & Stability (complete)
- CSTY-27: Map controls overhaul — fixed inverted pan/rotate, follow-mode cancellation, mobile touch support
- CSTY-28: Login page redesign + email/password registration
- CSTY-29: Desktop layout overhaul — search bar in AppHeader, collapsible sidebar, uiSlice persistence
- CSTY-30: UI polish pass — 8px spacing grid, 16:9 store cards, typography hierarchy, empty states
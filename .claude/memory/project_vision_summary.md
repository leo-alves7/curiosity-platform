---
name: Project Vision — Curiosity App
description: What Curiosity is, who it's for, and the two-tab gamified/technical UI split
type: project
originSessionId: abbb31d9-92f4-4c48-8fa2-b1db096e6988
---
Curiosity is a **mobile-first, real-time store discovery platform** (Google Maps + TripAdvisor + Waze). Users discover nearby stores on an interactive map and explore what's inside (catalogue, photos, videos, reviews).

**Why:** Helps people find stores they've never visited and are curious about — what's inside, what does it sell, how is the food.
**How to apply:** All design and implementation decisions should serve this vision. Mobile is primary; desktop is secondary.

## Two User Types
- **Normal users** — browse map, filter by category, add new stores they discover (community-sourced). May have limits on adding/deleting to prevent abuse.
- **Enterprise owners** — claim store listings, add catalogue/prices/videos/photos, purchase subscription plans (Standard → Premium → Sponsored). Sponsored stores get boosted map visibility and push notification priority.

## Two Main Tabs
- **Tab 1 — Navigation Map (gamified):** Real-time MapLibre map, pitch 45° 3D by default, store marker pins, GPS user location dot, Waze-like road tracking. Gamified visual style (bright colors, cartoon-like map theme, eventually 3D walking avatar via Threebox). Left-drag = rotate around position, right-drag = pan map.
- **Tab 2 — Store Explorer (technical/clean):** iFOOD-style scrollable list, debounced search, category filter chips, store detail view (catalogue, photos, reviews, directions).

## Monetization
- Stripe subscription plans for enterprise owners (more features = higher tier)
- Sponsored store placement (higher map appearance priority, push notifications to nearby users)
- Future: premium normal user profiles (Pokémon GO-style avatar customization)

## Key Architecture Decisions
- MapLibre GL JS is the right map renderer. Routing will be added via OSRM or Mapbox Directions API.
- PostGIS must be added to PostgreSQL for geospatial proximity queries.
- Ionic React + Capacitor for native iOS/Android + PWA from one codebase.
- react-i18next for i18n; EN default, PT-BR supported.
- Cloudflare R2 replaces MinIO in production.

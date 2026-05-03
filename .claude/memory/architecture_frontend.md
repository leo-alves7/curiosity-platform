---
name: Frontend Architecture — Redux Slices, Components, Patterns
description: Redux slice ownership, component organization rules, icon library, key implementation patterns for the Curiosity frontend
type: user
originSessionId: 52b396a5-4cd4-444e-b5ea-9ac6a3ab08c8
---
## Redux Slices (7 total)

| Slice | State owned |
|---|---|
| `authSlice` | `isAuthenticated`, `uid`, `email`, `isAdmin`, `displayName`, `photoURL` |
| `storesSlice` | `stores[]`, `loading`, `error`, pagination |
| `locationSlice` | `userLocation { lat, lng, accuracy }`, `isFollowingUser` |
| `mapSlice` | `mapCenter`, `mapZoom`, `selectedStoreId` |
| `uiSlice` | `isAddingStore`, `pinLocation`, `isPanelOpen`, `selectedTab` |
| `settingsSlice` | `theme ('light'|'dark'|'system')`, `language ('en'|'pt-BR'|null)` |
| `adminSlice` | admin UI state (editing store/category) |

**Persistence:** `settingsSlice` and `uiSlice` manually read/write `localStorage` — no redux-persist. Keys: `settings.theme`, `settings.language`, `ui.isPanelOpen`.

## Component Organization

- `components/` — shared-only reusable components (AppHeader, AppTabs, UserAvatar, ProfileMenu, Layout)
- `features/` — will hold feature-scoped work (map, stores, admin) — migration ticket T5 pending; currently mostly empty
- `hooks/` — shared React hooks (useUserLocation, useTheme, useIsMobile, usePinDrop)
- `pages/` — page-level route components (MapPage, ExplorePage, StoreDetailPage, LoginPage, AdminPage)

## Icon Library

`lucide-react` exclusively. `IonIcon` / `ionicons` are banned in new code. Legacy IonIcon usages remain — migration ticket T4 tracks cleanup.

## Key Implementation Patterns

**Pointer-lock rotation gate:** MapView uses a 4px drag threshold before pointer-lock rotation engages — plain left-clicks still fire normally. Any new feature that adds map click handlers must check `isAddingStoreRef.current` to suppress rotation during add-store mode.

**FAB stacking formula:** `bottomOffset + 16px` inside each FAB component. Mobile stack from bottom:
- 72px — LocateMeFab
- 136px — list toggle
- 200px — AddStore FAB
See `.claude/rules/frontend/ui-ux.md` for the exact table.

**Clustering + SVG markers:** `useMapMarkers` drives a MapLibre GeoJSON source (not HTML Marker instances). `storesToFeatureCollection(stores, categorySlugMap)` converts store data and embeds `category_slug` in each feature property. `storeClusterLayers.ts` defines 3 layers: `clusters` (circle), `cluster-count` (symbol), `unclustered-point` (symbol using `icon-image: coalesce(image('category:'+slug), image('category:default'))`). SVG marker images are pre-loaded by `useMapImageLoader(map, categories)` which also listens on `styledata` to re-register images after dark/light theme `setStyle()` calls. `useMapMarkers` accepts `categories: CategoryResponse[]` (not a pre-built map) and derives `categorySlugMap` internally via `useMemo`.

**fetchAllStores:** `storesSlice.fetchStoresAndCategories` calls `fetchAllStores()` which requests `page_size=10000` to load all stores into Redux at once. The list view still paginates client-side via `selectPaginatedFilteredStores`. Never revert to `fetchStores()` for the map feed.

**Theme system:** `settingsSlice` is the single source of truth. `useTheme` hook applies `ion-palette-dark` class and swaps map tile style via `map.setStyle()` (no page reload). Called once in `App.tsx` before any conditional returns.

**IonModal breakpoints:** `[0, 0.5, 1]` on mobile for bottom-sheet store panel; sidebar on desktop (`useIsMobile` hook).

**Auth flow:** `useAuth` in `App.tsx` subscribes to `onAuthStateChanged`; app renders spinner until initial auth resolves. `ProtectedRoute` reads `isAuthenticated` from Redux.

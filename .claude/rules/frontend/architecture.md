---
paths:
  - "webapp/src/**/*.{tsx,ts}"
---

# Frontend Architecture Rules

## Directory Ownership

### `features/`
Feature-scoped directories. Each major product domain gets its own subdirectory:
`features/map/`, `features/stores/`, `features/admin/`.

All components, hooks, and utilities that belong to **exactly one feature** live here — not in `components/` or `hooks/`. If you are building something for the map feature, it goes in `features/map/`, not `components/`.

### `components/`
Shared-only reusable components used by **more than one feature**: `AppHeader`, `AppTabs`, `UserAvatar`, `ProfileMenu`, `Layout`.

If a component is used in only one feature, it belongs in `features/X/`, not here. Moving it to `components/` when it has a single consumer creates false coupling.

### `pages/`
Thin route wrappers only. Pages compose features — they do not contain business logic, data fetching, or non-trivial JSX. A page file should import feature components and lay them out; nothing more.

### `hooks/`
Shared React hooks used by more than one feature: `useUserLocation`, `useTheme`, `useIsMobile`, `usePinDrop`.

Feature-specific hooks (e.g. a hook that is only used inside `features/map/`) live in `features/map/`, not here.

### `api/`
HTTP layer only. API hooks call axios and return data. No business logic in `api/` — data transformation and decisions belong in managers or components.

### `slices/`
Redux state. One slice per domain, not per component. Never create a slice for a single component's local state — use `useState` for that.

---

## Redux Slice Ownership

Each piece of state has exactly one owning slice. Never duplicate state across slices.

| Slice | Owns |
|---|---|
| `authSlice` | `isAuthenticated`, `uid`, `email`, `isAdmin`, `displayName`, `photoURL` |
| `storesSlice` | `stores[]`, `loading`, `error`, pagination |
| `locationSlice` | `userLocation { lat, lng, accuracy }`, `isFollowingUser` |
| `mapSlice` | `mapCenter`, `mapZoom`, `selectedStoreId` |
| `uiSlice` | `isAddingStore`, `pinLocation`, `isPanelOpen`, `selectedTab` |
| `settingsSlice` | `theme ('light'|'dark'|'system')`, `language ('en'|'pt-BR'|null)` |
| `adminSlice` | admin UI editing state |

**Persistence rule:** `settingsSlice` and `uiSlice` read/write `localStorage` directly. No `redux-persist`. Keys: `settings.theme`, `settings.language`, `ui.isPanelOpen`.

If you find yourself putting map state in `uiSlice`, or location state in `mapSlice`, that is a violation. Put it in the owning slice.

---

## Icon Rule

Use `lucide-react` for **all** icons. Never use `IonIcon` or import from `ionicons`.

Ionic components (`IonButton`, `IonFab`, `IonCard`, etc.) are fine — this rule applies only to icon rendering. Pass a lucide icon component as a child or prop instead of using `<IonIcon icon={...} />`.

Legacy `IonIcon` usages exist in older code — they are tracked by ticket T4 for migration. Do not add new ones.

---

## File Size Rule

Keep files under **~300 lines**. If a component file exceeds this:

- Split into sub-components in the same `features/X/` directory
- A component that renders multiple distinct sections → each section becomes its own sub-component file
- A hook that handles multiple concerns → split into focused single-concern hooks

Do not create a monolithic 500-line component. Apply the split at implementation time, not as a post-step refactor.

---

## Testing Rule

Every component in `features/` or `components/` needs a `.test.tsx` file alongside it.

Every shared hook in `hooks/` needs a `.test.ts` file alongside it.

Tests use Vitest + React Testing Library. Mock API calls with `msw`. Do not mock Redux slices — use a real store with test data.
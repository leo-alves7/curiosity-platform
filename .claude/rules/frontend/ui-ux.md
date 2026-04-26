---
paths:
  - "webapp/src/**/*.{tsx,ts}"
---

# Frontend UI/UX Rules

## Mobile-first

- Design for 375px width first. Desktop layout is secondary.
- Use Ionic's responsive utilities (`IonGrid`, `IonCol` breakpoints) for desktop adaptation.
- Touch targets must be at least 44×44px (Ionic components satisfy this by default).
- Bottom tab navigation (`IonTabs`) is the primary navigation pattern — not top nav drawers.

## Dark mode

- Never use hardcoded color values (hex, rgb, named CSS colors) in component styles.
- Always use Ionic CSS variables: `--ion-color-primary`, `--ion-background-color`, `--ion-text-color`, `--ion-card-background`, etc.
- Dark mode is toggled by adding the `ion-palette-dark` class to `<html>`. Components that use Ionic CSS variables get dark mode for free.
- Test every new component in both light and dark mode before marking done.

## Map (MapLibre)

- All map interactions go through the `MapView` component and its hooks (`useMapMarkers`, etc.).
- Never instantiate a second `maplibregl.Map` — there is exactly one map instance per page.
- Map controls (FABs, overlays) are rendered as React children overlaid on top of the map canvas, not as MapLibre controls.
- Map pitch defaults to `45` and bearing to `0` — do not reset these unless explicitly required.
- Left-drag = rotate (locked center); right-drag = pan. Do not override these bindings.

### Pointer-lock interaction (important for any feature that uses map clicks)

`MapView` uses `requestPointerLock()` on left-click to implement the custom rotation. This means:
- Any feature that needs to capture a raw left-click on the map (e.g. pin-drop mode) will be broken if pointer lock is acquired first — the browser freezes `clientX/Y` at 0 and MapLibre's `click` event gets wrong coordinates.
- To suppress pointer lock for a mode: add a `useRef` in `MapView` tracking the relevant Redux state, and gate `requestPointerLock()` on that ref in `onPointerDown`. Example: `if (e.button === 0 && !isAddingStoreRef.current) container.requestPointerLock?.()`. The ref is needed because the pointer handler lives in a `useEffect(() => {}, [])` closure.

### FAB stacking on the map canvas

All bottom-right FABs on the map share `right: 16px`. Stacking order (bottom → top):

**Mobile** (tab bar is 56 px tall, `TAB_BAR_HEIGHT` from `AppTabs`):
| FAB | Component | `bottomOffset` prop | Rendered `bottom` |
|---|---|---|---|
| Locate Me | `LocateMeFab` | `TAB_BAR_HEIGHT` (56) | 72 px |
| List toggle | inline `IonFab` in MapPage | — | `TAB_BAR_HEIGHT + 16 + 56 + 8` = 136 px |
| Add Store | `AddStoreButton` | `TAB_BAR_HEIGHT + 56 + 8 + 56 + 8` = 184 | 200 px |

**Desktop** (no tab bar; `LocateMeFab` is rendered inside `MapView` with `bottomOffset=0`):
| FAB | Component | `bottomOffset` prop | Rendered `bottom` |
|---|---|---|---|
| Locate Me | inside `MapView` | 0 | 16 px |
| Add Store | `AddStoreButton` | 64 | 80 px |

**Rule**: `LocateMeFab` and any button component that uses `bottomOffset + 16` as its `bottom` — be precise. The `+16` is added **inside** the component. When computing `bottomOffset` for a button above a previous one, calculate: `previousBottom + previousHeight(56) + gap(8) - 16`. A stray extra `+16` in the caller creates a 24 px gap instead of 8 px; a missing `+16` causes an overlap.

When adding a new FAB: update both mobile and desktop stacks in this table and in `MapPage`.

## Ionic React

- Use Ionic components for all UI: `IonCard`, `IonButton`, `IonFab`, `IonModal`, `IonSheet`, `IonToast`, `IonSearchbar`, etc.
- Never import from MUI, Chakra, Ant Design, or any non-Ionic UI library.
- Use `IonSkeletonText` for loading states, not custom spinners.
- Use `IonToast` for transient notifications (not custom divs).

## Internationalization (i18n)

- Every user-facing string must use the `t()` function from `react-i18next`.
- No hardcoded English (or any language) strings in JSX: bad → `<p>Loading...</p>`, good → `<p>{t('common.loading')}</p>`.
- Translation keys use dot-notation namespacing: `map.locateMe`, `store.addNew`, `auth.logout`, etc.
- Locale files live in `webapp/src/locales/en.json` and `webapp/src/locales/pt-BR.json`.
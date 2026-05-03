---
name: Key Implementation Gotchas
description: Non-obvious implementation details and patterns that future sessions must know to avoid breaking things
type: project
originSessionId: 52b396a5-4cd4-444e-b5ea-9ac6a3ab08c8
---
## MapView — Pointer-Lock Rotation

Plain left-clicks work cleanly because of a 4px drag threshold: rotation only engages after 4px of movement. Any new feature that registers map click handlers must check `isAddingStoreRef.current` in `MapView.tsx` — this ref suppresses rotation during add-store mode.

**Why:** Without the ref check, entering add-store mode would conflict with the pointer-lock camera orbit.

## FAB Stacking Formula

Each FAB uses `bottomOffset + 16px` to stack above the previous one. Mobile stack from bottom:
- 72px — LocateMeFab
- 136px — list toggle FAB
- 200px — AddStore FAB

See `.claude/rules/frontend/ui-ux.md` for the precise table. Violating this causes FABs to overlap.

## Clustering Replaces HTML Markers Entirely

`useMapMarkers` drives a MapLibre GeoJSON source — there are no `maplibregl.Marker` HTML instances for store markers. Do not add individual Marker instances for stores; add GeoJSON features to the source instead.

## settingsSlice — Single Source of Truth

`settingsSlice` owns `theme` and `language`. Both persist to `localStorage` manually (keys `settings.theme`, `settings.language`). The `useTheme` hook reads from Redux, applies `ion-palette-dark` to `<html>`, and calls `map.setStyle()` for dark/light tile swap — no page reload.

## IonModal Breakpoints

Store panel uses `breakpoints={[0, 0.5, 1]}` on mobile (half-sheet), sidebar on desktop. The `useIsMobile` hook (`< 768px`) determines which layout to render.

## Follow Mode Cancellation

GPS follow mode (`isFollowingUser`) is cancelled in `MapView`'s `onPointerDown` handler on right-click (button 2), not via MapLibre's `dragstart` event — because `dragPan` is disabled and MapLibre never fires `dragstart` in this setup.

## Canvas-Using Libraries in jsdom (vitest)

Any library that uses `HTMLCanvasElement.getContext()` internally — including `lottie-web` (via `lottie-react`) and `maplibre-gl` — will crash in jsdom with `TypeError: Cannot set properties of null (setting 'fillStyle')` or `Not implemented: HTMLCanvasElement's getContext()`. The crash happens at module load time, before any `vi.mock()` in a test file can intercept it.

**Fix:** Create a no-op mock at `webapp/src/__mocks__/<library>.tsx` and add a `test.alias` entry in `vite.config.ts`:
```ts
test: {
  alias: {
    'lottie-react': resolve(__dirname, './src/__mocks__/lottie-react.tsx'),
  }
}
```
This redirects the import before the canvas crash fires. Any future canvas-dependent library (three.js, etc.) needs the same treatment.

## adminSlice — Single `status` Field Covers Only Stores

`adminSlice` has a single `status: 'idle' | 'loading' | 'succeeded' | 'failed'` field that is only set by `fetchAdminStoresThunk` (pending/fulfilled/rejected). `fetchAdminCategoriesThunk` does NOT update `status`. Consequence: `CategoryManagement` cannot use `status === 'succeeded'` as an empty-state guard — it will never be true unless stores were also fetched. Use `categories.length === 0` directly in `CategoryManagement`.

**Why:** `StoreManagement` dispatches both thunks; `CategoryManagement` only dispatches the categories thunk. Fixing this properly would require a separate `categoriesStatus` field in adminSlice.

## i18n Auto-Detection

Language auto-detection checks `navigator.language` (any locale starting with `"pt"`) AND `Intl.DateTimeFormat` timezone against 18 Brazilian IANA timezone strings. Logic is in `webapp/src/i18n/detectLanguage.ts` (pure function, fully unit-tested). Auto-detection is bypassed after a manual language selection (`settings.language !== null`).

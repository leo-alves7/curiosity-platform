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
---
name: Frontend UI library — Ionic React (not MUI)
description: The project uses Ionic React as the only UI library; MUI was tried and rejected
type: project
originSessionId: 7ca89e90-acec-430f-bbff-a2cae214c9d3
---
Ionic React (`@ionic/react`, `@ionic/core`, `ionicons`) is the sole UI component library for the frontend.

**Why:** Mobile-first product decision made by the user after an initial MUI implementation was shipped on CSTY-1.

**How to apply:** Never use MUI (`@mui/material`, `@emotion/*`) in this project. All layout, navigation, and UI primitives must use Ionic components (`IonApp`, `IonPage`, `IonContent`, `IonHeader`, `IonToolbar`, etc.). `setupIonicReact()` must be called in `App.tsx` before rendering.

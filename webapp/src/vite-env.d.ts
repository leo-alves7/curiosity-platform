/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_MAPLIBRE_STYLE_URL?: string
  readonly VITE_MAPLIBRE_STYLE_URL_LIGHT?: string
  readonly VITE_MAPLIBRE_STYLE_URL_DARK?: string
  readonly VITE_APP_URL?: string
  readonly VITE_SENTRY_DSN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

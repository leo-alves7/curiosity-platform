import * as Sentry from '@sentry/capacitor'
import { init as sentryReactInit } from '@sentry/react'

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return

  Sentry.init(
    {
      dsn,
      integrations: [Sentry.browserTracingIntegration()],
      tracesSampleRate: 0.1,
      beforeSend(event) {
        if (event.request?.headers) {
          delete event.request.headers['Authorization']
        }
        return event
      },
    },
    sentryReactInit,
  )
}

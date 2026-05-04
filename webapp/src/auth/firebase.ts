import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'
import type { Analytics } from 'firebase/analytics'

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
})

export const auth = getAuth(app)
export const analytics: Analytics | null =
  import.meta.env.MODE !== 'development' ? getAnalytics(app) : null
export default app

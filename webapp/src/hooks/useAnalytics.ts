import { logEvent } from 'firebase/analytics'
import type { Analytics } from 'firebase/analytics'
import { analytics } from '@/auth/firebase'

type LoginMethod = 'google' | 'apple' | 'email'
type Tab = 'map' | 'explore'

export function useAnalytics() {
  const trackAppOpen = () => {
    if (!analytics) return
    logEvent(analytics as Analytics, 'app_open')
  }

  const trackStoreViewed = (storeId: string) => {
    if (!analytics) return
    logEvent(analytics as Analytics, 'store_viewed', { store_id: storeId })
  }

  const trackStoreAdded = () => {
    if (!analytics) return
    logEvent(analytics as Analytics, 'store_added')
  }

  const trackSearchPerformed = (queryLength: number) => {
    if (!analytics) return
    logEvent(analytics as Analytics, 'search_performed', { query_length: queryLength })
  }

  const trackTabSwitched = (tab: Tab) => {
    if (!analytics) return
    logEvent(analytics as Analytics, 'tab_switched', { tab })
  }

  const trackLoginCompleted = (method: LoginMethod) => {
    if (!analytics) return
    logEvent(analytics as Analytics, 'login_completed', { method })
  }

  const trackRegistrationCompleted = () => {
    if (!analytics) return
    logEvent(analytics as Analytics, 'registration_completed')
  }

  return {
    trackAppOpen,
    trackStoreViewed,
    trackStoreAdded,
    trackSearchPerformed,
    trackTabSwitched,
    trackLoginCompleted,
    trackRegistrationCompleted,
  }
}

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

const mockLogEvent = vi.fn()
let mockAnalytics: object | null = null

vi.mock('@/auth/firebase', () => ({
  auth: {},
  get analytics() {
    return mockAnalytics
  },
}))

vi.mock('firebase/analytics', () => ({
  getAnalytics: () => null,
  logEvent: (...args: unknown[]) => mockLogEvent(...args),
}))

import { useAnalytics } from './useAnalytics'

describe('useAnalytics', () => {
  beforeEach(() => {
    mockLogEvent.mockClear()
    mockAnalytics = null
  })

  describe('when analytics is null', () => {
    it('trackAppOpen does not call logEvent', () => {
      const { result } = renderHook(() => useAnalytics())
      result.current.trackAppOpen()
      expect(mockLogEvent).not.toHaveBeenCalled()
    })

    it('trackStoreViewed does not call logEvent', () => {
      const { result } = renderHook(() => useAnalytics())
      result.current.trackStoreViewed('store-123')
      expect(mockLogEvent).not.toHaveBeenCalled()
    })

    it('trackStoreAdded does not call logEvent', () => {
      const { result } = renderHook(() => useAnalytics())
      result.current.trackStoreAdded()
      expect(mockLogEvent).not.toHaveBeenCalled()
    })

    it('trackSearchPerformed does not call logEvent', () => {
      const { result } = renderHook(() => useAnalytics())
      result.current.trackSearchPerformed(5)
      expect(mockLogEvent).not.toHaveBeenCalled()
    })

    it('trackTabSwitched does not call logEvent', () => {
      const { result } = renderHook(() => useAnalytics())
      result.current.trackTabSwitched('map')
      expect(mockLogEvent).not.toHaveBeenCalled()
    })

    it('trackLoginCompleted does not call logEvent', () => {
      const { result } = renderHook(() => useAnalytics())
      result.current.trackLoginCompleted('google')
      expect(mockLogEvent).not.toHaveBeenCalled()
    })

    it('trackRegistrationCompleted does not call logEvent', () => {
      const { result } = renderHook(() => useAnalytics())
      result.current.trackRegistrationCompleted()
      expect(mockLogEvent).not.toHaveBeenCalled()
    })
  })

  describe('when analytics is non-null', () => {
    beforeEach(() => {
      mockAnalytics = { name: 'test-analytics' }
    })

    it('trackAppOpen calls logEvent with app_open', () => {
      const { result } = renderHook(() => useAnalytics())
      result.current.trackAppOpen()
      expect(mockLogEvent).toHaveBeenCalledWith(mockAnalytics, 'app_open')
    })

    it('trackStoreViewed calls logEvent with store_viewed and store_id', () => {
      const { result } = renderHook(() => useAnalytics())
      result.current.trackStoreViewed('store-uuid-123')
      expect(mockLogEvent).toHaveBeenCalledWith(mockAnalytics, 'store_viewed', {
        store_id: 'store-uuid-123',
      })
    })

    it('trackStoreAdded calls logEvent with store_added', () => {
      const { result } = renderHook(() => useAnalytics())
      result.current.trackStoreAdded()
      expect(mockLogEvent).toHaveBeenCalledWith(mockAnalytics, 'store_added')
    })

    it('trackSearchPerformed calls logEvent with search_performed and query_length', () => {
      const { result } = renderHook(() => useAnalytics())
      result.current.trackSearchPerformed(7)
      expect(mockLogEvent).toHaveBeenCalledWith(mockAnalytics, 'search_performed', {
        query_length: 7,
      })
    })

    it('trackTabSwitched calls logEvent with tab_switched and tab', () => {
      const { result } = renderHook(() => useAnalytics())
      result.current.trackTabSwitched('explore')
      expect(mockLogEvent).toHaveBeenCalledWith(mockAnalytics, 'tab_switched', { tab: 'explore' })
    })

    it('trackLoginCompleted calls logEvent with login_completed and method', () => {
      const { result } = renderHook(() => useAnalytics())
      result.current.trackLoginCompleted('email')
      expect(mockLogEvent).toHaveBeenCalledWith(mockAnalytics, 'login_completed', {
        method: 'email',
      })
    })

    it('trackRegistrationCompleted calls logEvent with registration_completed', () => {
      const { result } = renderHook(() => useAnalytics())
      result.current.trackRegistrationCompleted()
      expect(mockLogEvent).toHaveBeenCalledWith(mockAnalytics, 'registration_completed')
    })
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { createElement } from 'react'
import locationReducer from '@/slices/locationSlice'
import { useUserLocation } from './useUserLocation'

function makeStore() {
  return configureStore({ reducer: { location: locationReducer } })
}

function makeWrapper(store: ReturnType<typeof makeStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(Provider, { store, children })
  }
}

// Stable mock that persists across the entire describe block so React's async
// cleanup (which runs after afterEach) still finds geolocation available.
const watchPositionMock = vi.fn()
const clearWatchMock = vi.fn()

const geolocationMock = {
  watchPosition: watchPositionMock,
  clearWatch: clearWatchMock,
}

Object.defineProperty(navigator, 'geolocation', {
  value: geolocationMock,
  configurable: true,
  writable: true,
})

describe('useUserLocation', () => {
  let capturedSuccess: PositionCallback | null = null
  let capturedError: PositionErrorCallback | null = null

  beforeEach(() => {
    capturedSuccess = null
    capturedError = null
    vi.clearAllMocks()

    watchPositionMock.mockImplementation(
      (success: PositionCallback, error: PositionErrorCallback) => {
        capturedSuccess = success
        capturedError = error
        return 42
      },
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('calls watchPosition on mount', () => {
    const store = makeStore()
    renderHook(() => useUserLocation(), { wrapper: makeWrapper(store) })
    expect(watchPositionMock).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), {
      enableHighAccuracy: true,
    })
  })

  it('dispatches setUserLocation on geolocation success', () => {
    const store = makeStore()
    renderHook(() => useUserLocation(), { wrapper: makeWrapper(store) })

    capturedSuccess!({
      coords: { latitude: -23.55, longitude: -46.63, accuracy: 15 },
    } as GeolocationPosition)

    const state = store.getState()
    expect(state.location.userLocation).toEqual({ lat: -23.55, lng: -46.63, accuracy: 15 })
  })

  it('logs error on geolocation failure', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const store = makeStore()
    renderHook(() => useUserLocation(), { wrapper: makeWrapper(store) })

    capturedError!({ code: 1 } as GeolocationPositionError)

    expect(consoleSpy).toHaveBeenCalledWith('Geolocation error', 1)
    consoleSpy.mockRestore()
  })

  it('calls clearWatch on unmount', () => {
    const store = makeStore()
    const { unmount } = renderHook(() => useUserLocation(), { wrapper: makeWrapper(store) })
    unmount()
    expect(clearWatchMock).toHaveBeenCalledWith(42)
  })
})

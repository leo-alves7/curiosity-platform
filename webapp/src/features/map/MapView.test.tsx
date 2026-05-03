import '@/i18n/index'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/slices/authSlice'
import storesReducer from '@/slices/storesSlice'
import mapReducer from '@/slices/mapSlice'
import locationReducer from '@/slices/locationSlice'
import uiReducer from '@/slices/uiSlice'
import settingsReducer, { type ThemePreference } from '@/slices/settingsSlice'
import MapView from './MapView'

vi.mock('@/hooks/useUserLocation', () => ({
  useUserLocation: vi.fn(),
}))

vi.mock('./UserLocationLayer', () => ({
  default: vi.fn().mockReturnValue(null),
}))

vi.mock('./LocateMeFab', () => ({
  default: vi.fn().mockReturnValue(null),
}))

vi.mock('maplibre-gl', () => ({
  default: {
    Map: vi.fn().mockImplementation(() => ({
      remove: vi.fn(),
      on: vi.fn(),
      addControl: vi.fn(),
      getCenter: vi.fn().mockReturnValue({ lng: -53.45528, lat: -24.95583 }),
      getZoom: vi.fn().mockReturnValue(12),
      getBearing: vi.fn().mockReturnValue(0),
      setBearing: vi.fn(),
      getPitch: vi.fn().mockReturnValue(45),
      setPitch: vi.fn(),
      panBy: vi.fn(),
      easeTo: vi.fn(),
      setStyle: vi.fn(),
      dragPan: { enable: vi.fn(), disable: vi.fn() },
      dragRotate: { enable: vi.fn(), disable: vi.fn() },
      touchZoomRotate: { enable: vi.fn(), disable: vi.fn() },
    })),
    AttributionControl: vi.fn().mockImplementation(() => ({})),
    Marker: vi.fn().mockImplementation(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      setPopup: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn(),
    })),
    Popup: vi.fn().mockImplementation(() => ({
      setDOMContent: vi.fn().mockReturnThis(),
    })),
  },
}))

vi.mock('./useMapMarkers', () => ({
  useMapMarkers: vi.fn(),
}))

vi.mock('./useStoreClusterHandlers', () => ({
  useStoreClusterHandlers: vi.fn(),
}))

vi.mock('@/slices/storesSlice', async () => {
  const actual = await vi.importActual('@/slices/storesSlice')
  return {
    ...actual,
    fetchStoresAndCategories: Object.assign(
      vi.fn().mockReturnValue({ type: 'stores/fetchStoresAndCategories/pending' }),
      {
        pending: { type: 'stores/fetchStoresAndCategories/pending', match: vi.fn() },
        fulfilled: { type: 'stores/fetchStoresAndCategories/fulfilled', match: vi.fn() },
        rejected: { type: 'stores/fetchStoresAndCategories/rejected', match: vi.fn() },
      },
    ),
  }
})

function makeStore(storesOverrides = {}, theme: ThemePreference = 'system') {
  return configureStore({
    reducer: {
      auth: authReducer,
      stores: storesReducer,
      map: mapReducer,
      location: locationReducer,
      ui: uiReducer,
      settings: settingsReducer,
    },
    preloadedState: {
      stores: {
        items: [],
        categories: [],
        categoryMap: {},
        status: 'idle' as const,
        error: null,
        searchQuery: '',
        selectedCategoryId: null,
        page: 1,
        pageSize: 20,
        hasMore: false,
        ...storesOverrides,
      },
      settings: { theme, language: null as null },
    },
  })
}

function setup({ storesOverrides = {}, theme = 'system' as ThemePreference } = {}) {
  const store = makeStore(storesOverrides, theme)
  const result = render(
    <Provider store={store}>
      <MapView />
    </Provider>,
  )
  return { store, ...result }
}

describe('MapView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    const { container } = setup()
    expect(container).toBeDefined()
  })

  it('shows loading spinner when status is loading', () => {
    const { container } = setup({ storesOverrides: { status: 'loading' } })
    expect(container.querySelector('ion-spinner')).not.toBeNull()
  })

  it('shows error message when status is failed', () => {
    setup({ storesOverrides: { status: 'failed', error: 'Network error' } })
    expect(screen.getByText(/Failed to load stores: Network error/)).toBeDefined()
  })

  it('renders map container when succeeded', () => {
    const { container } = setup({ storesOverrides: { status: 'succeeded' } })
    expect(container.querySelector('div')).toBeDefined()
  })

  it('initializes map with pitch 45 and bearing 0', async () => {
    const maplibregl = await import('maplibre-gl')
    setup()
    const MapConstructor = vi.mocked(maplibregl.default.Map)
    expect(MapConstructor).toHaveBeenCalledWith(expect.objectContaining({ pitch: 45, bearing: 0 }))
  })

  it('disables default drag handlers on initialization', async () => {
    const maplibregl = await import('maplibre-gl')
    setup()
    const mapInstance = vi.mocked(maplibregl.default.Map).mock.results[0]?.value
    expect(mapInstance?.dragPan.disable).toHaveBeenCalled()
    expect(mapInstance?.dragRotate.disable).toHaveBeenCalled()
  })

  it('pans map on left pointer drag', async () => {
    const maplibregl = await import('maplibre-gl')
    const { container } = setup()
    const mapInstance = vi.mocked(maplibregl.default.Map).mock.results[0]?.value
    const mapDiv = container.querySelector('div > div > div') as HTMLElement

    mapDiv.dispatchEvent(
      new PointerEvent('pointerdown', { button: 0, clientX: 100, clientY: 100, bubbles: true }),
    )
    mapDiv.dispatchEvent(
      new PointerEvent('pointermove', {
        button: 0,
        clientX: 150,
        clientY: 100,
        buttons: 1,
        bubbles: true,
      }),
    )
    mapDiv.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))

    expect(mapInstance?.panBy).toHaveBeenCalled()
  })

  it('rotates map on right pointer drag', async () => {
    const maplibregl = await import('maplibre-gl')
    const { container } = setup()
    const mapInstance = vi.mocked(maplibregl.default.Map).mock.results[0]?.value
    const mapDiv = container.querySelector('div > div > div') as HTMLElement

    mapDiv.dispatchEvent(
      new PointerEvent('pointerdown', { button: 2, clientX: 100, clientY: 100, bubbles: true }),
    )
    mapDiv.dispatchEvent(
      new PointerEvent('pointermove', {
        button: 2,
        clientX: 150,
        clientY: 110,
        buttons: 2,
        bubbles: true,
      }),
    )
    mapDiv.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))

    expect(mapInstance?.setBearing).toHaveBeenCalled()
  })

  it('adjusts pitch on middle mouse button drag', async () => {
    const maplibregl = await import('maplibre-gl')
    const { container } = setup()
    const mapInstance = vi.mocked(maplibregl.default.Map).mock.results[0]?.value
    const mapDiv = container.querySelector('div > div > div') as HTMLElement

    mapDiv.dispatchEvent(
      new PointerEvent('pointerdown', { button: 1, clientX: 100, clientY: 100, bubbles: true }),
    )
    mapDiv.dispatchEvent(
      new PointerEvent('pointermove', {
        button: 1,
        clientX: 100,
        clientY: 70,
        buttons: 4,
        bubbles: true,
      }),
    )
    mapDiv.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))

    expect(mapInstance?.setPitch).toHaveBeenCalled()
  })

  it('uses VITE_MAPLIBRE_STYLE_URL_LIGHT env var for light mode style', async () => {
    const maplibregl = await import('maplibre-gl')
    vi.stubEnv('VITE_MAPLIBRE_STYLE_URL_LIGHT', 'https://tiles.openfreemap.org/styles/liberty')
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    )
    setup()
    const MapConstructor = vi.mocked(maplibregl.default.Map)
    expect(MapConstructor).toHaveBeenCalledWith(
      expect.objectContaining({ style: 'https://tiles.openfreemap.org/styles/liberty' }),
    )
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('does NOT cancel follow mode on right-click without drag', async () => {
    const { container, store } = setup()
    const mapDiv = container.querySelector('div > div > div') as HTMLElement

    const { setFollowingUser } = await import('@/slices/locationSlice')
    store.dispatch(setFollowingUser(true))
    expect(store.getState().location.isFollowingUser).toBe(true)

    mapDiv.dispatchEvent(
      new PointerEvent('pointerdown', { button: 2, clientX: 100, clientY: 100, bubbles: true }),
    )

    expect(store.getState().location.isFollowingUser).toBe(true)
  })

  it('cancels follow mode when left-drag threshold is crossed', async () => {
    const { container, store } = setup()
    const { setFollowingUser } = await import('@/slices/locationSlice')
    store.dispatch(setFollowingUser(true))
    expect(store.getState().location.isFollowingUser).toBe(true)

    const mapDiv = container.querySelector('div > div > div') as HTMLElement
    mapDiv.dispatchEvent(
      new PointerEvent('pointerdown', { button: 0, clientX: 100, clientY: 100, bubbles: true }),
    )
    mapDiv.dispatchEvent(
      new PointerEvent('pointermove', {
        button: 0,
        clientX: 150,
        clientY: 100,
        buttons: 1,
        bubbles: true,
      }),
    )

    expect(store.getState().location.isFollowingUser).toBe(false)
  })

  it('cancels follow mode when right-drag threshold is crossed', async () => {
    const { container, store } = setup()
    const { setFollowingUser } = await import('@/slices/locationSlice')
    store.dispatch(setFollowingUser(true))
    expect(store.getState().location.isFollowingUser).toBe(true)

    const mapDiv = container.querySelector('div > div > div') as HTMLElement
    mapDiv.dispatchEvent(
      new PointerEvent('pointerdown', { button: 2, clientX: 100, clientY: 100, bubbles: true }),
    )
    mapDiv.dispatchEvent(
      new PointerEvent('pointermove', {
        button: 2,
        clientX: 150,
        clientY: 100,
        buttons: 2,
        bubbles: true,
      }),
    )

    expect(store.getState().location.isFollowingUser).toBe(false)
  })

  it('cancels follow mode on scroll wheel', async () => {
    const { container, store } = setup()
    const { setFollowingUser } = await import('@/slices/locationSlice')
    store.dispatch(setFollowingUser(true))
    expect(store.getState().location.isFollowingUser).toBe(true)

    const mapDiv = container.querySelector('div > div > div') as HTMLElement
    mapDiv.dispatchEvent(new WheelEvent('wheel', { bubbles: true }))

    expect(store.getState().location.isFollowingUser).toBe(false)
  })

  it('pans map on single-finger touch drag', async () => {
    const maplibregl = await import('maplibre-gl')
    const { container } = setup()
    const mapInstance = vi.mocked(maplibregl.default.Map).mock.results[0]?.value
    const mapDiv = container.querySelector('div > div > div') as HTMLElement

    mapDiv.dispatchEvent(
      new PointerEvent('pointerdown', {
        button: 0,
        pointerType: 'touch',
        pointerId: 1,
        clientX: 100,
        clientY: 100,
        bubbles: true,
      }),
    )
    mapDiv.dispatchEvent(
      new PointerEvent('pointermove', {
        pointerType: 'touch',
        pointerId: 1,
        clientX: 150,
        clientY: 100,
        buttons: 1,
        bubbles: true,
      }),
    )
    mapDiv.dispatchEvent(
      new PointerEvent('pointerup', { pointerType: 'touch', pointerId: 1, bubbles: true }),
    )

    expect(mapInstance?.panBy).toHaveBeenCalled()
  })

  it('does NOT pan or rotate on two-finger touch drag', async () => {
    const maplibregl = await import('maplibre-gl')
    const { container } = setup()
    const mapInstance = vi.mocked(maplibregl.default.Map).mock.results[0]?.value
    const mapDiv = container.querySelector('div > div > div') as HTMLElement

    mapDiv.dispatchEvent(
      new PointerEvent('pointerdown', {
        button: 0,
        pointerType: 'touch',
        pointerId: 1,
        clientX: 100,
        clientY: 100,
        bubbles: true,
      }),
    )
    mapDiv.dispatchEvent(
      new PointerEvent('pointerdown', {
        button: 0,
        pointerType: 'touch',
        pointerId: 2,
        clientX: 200,
        clientY: 100,
        bubbles: true,
      }),
    )
    mapDiv.dispatchEvent(
      new PointerEvent('pointermove', {
        pointerType: 'touch',
        pointerId: 1,
        clientX: 150,
        clientY: 100,
        buttons: 1,
        bubbles: true,
      }),
    )

    expect(mapInstance?.panBy).not.toHaveBeenCalled()
    expect(mapInstance?.setBearing).not.toHaveBeenCalled()
  })

  it('calls setStyle when effectiveTheme changes after mount', async () => {
    vi.stubEnv('VITE_MAPLIBRE_STYLE_URL_DARK', 'https://example.com/dark')
    vi.stubEnv('VITE_MAPLIBRE_STYLE_URL_LIGHT', 'https://example.com/light')
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    )
    const maplibregl = await import('maplibre-gl')
    const { store } = setup({ theme: 'light' })
    const mapInstance = vi.mocked(maplibregl.default.Map).mock.results[0]?.value
    // setStyle must NOT be called on initial mount (map already created with correct style)
    expect(mapInstance?.setStyle).not.toHaveBeenCalled()
    // Dispatch a theme change — the reactive effect should now call setStyle
    const { setTheme } = await import('@/slices/settingsSlice')
    await import('@testing-library/react').then(({ act }) =>
      act(() => {
        store.dispatch(setTheme('dark'))
      }),
    )
    expect(mapInstance?.setStyle).toHaveBeenCalledWith('https://example.com/dark')
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('calls useStoreClusterHandlers with map and stores', async () => {
    const { useStoreClusterHandlers } = await import('./useStoreClusterHandlers')
    setup()
    expect(vi.mocked(useStoreClusterHandlers)).toHaveBeenCalled()
  })

  it('calls useStoreClusterHandlers with onViewDetails callback', async () => {
    const { useStoreClusterHandlers } = await import('./useStoreClusterHandlers')
    const onViewDetails = vi.fn()
    const store = makeStore()
    render(
      <Provider store={store}>
        <MapView onViewDetails={onViewDetails} />
      </Provider>,
    )
    expect(vi.mocked(useStoreClusterHandlers)).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Array),
      expect.any(Object),
      expect.any(Function),
    )
  })
})

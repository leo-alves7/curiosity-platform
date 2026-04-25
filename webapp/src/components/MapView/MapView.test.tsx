import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/slices/authSlice'
import storesReducer from '@/slices/storesSlice'
import mapReducer from '@/slices/mapSlice'
import locationReducer from '@/slices/locationSlice'
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
      dragPan: { enable: vi.fn(), disable: vi.fn() },
      dragRotate: { enable: vi.fn(), disable: vi.fn() },
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

function makeStore(storesOverrides = {}) {
  return configureStore({
    reducer: {
      auth: authReducer,
      stores: storesReducer,
      map: mapReducer,
      location: locationReducer,
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
    },
  })
}

function setup(storesOverrides = {}) {
  const store = makeStore(storesOverrides)
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
    const { container } = setup({ status: 'loading' })
    expect(container.querySelector('ion-spinner')).not.toBeNull()
  })

  it('shows error message when status is failed', () => {
    setup({ status: 'failed', error: 'Network error' })
    expect(screen.getByText(/Failed to load stores: Network error/)).toBeDefined()
  })

  it('renders map container when succeeded', () => {
    const { container } = setup({ status: 'succeeded' })
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

  it('rotates map on left pointer drag', async () => {
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

    expect(mapInstance?.setBearing).toHaveBeenCalled()
  })

  it('pans map on right pointer drag', async () => {
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

    expect(mapInstance?.panBy).toHaveBeenCalled()
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
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
    setup()
    const MapConstructor = vi.mocked(maplibregl.default.Map)
    expect(MapConstructor).toHaveBeenCalledWith(
      expect.objectContaining({ style: 'https://tiles.openfreemap.org/styles/liberty' }),
    )
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('dispatches setFollowingUser(false) when user right-clicks to pan', async () => {
    const { container, store } = setup()
    const mapDiv = container.querySelector('div > div > div') as HTMLElement

    // Pre-set following to true so we can verify it gets cleared
    const { setFollowingUser } = await import('@/slices/locationSlice')
    store.dispatch(setFollowingUser(true))
    expect(store.getState().location.isFollowingUser).toBe(true)

    mapDiv.dispatchEvent(
      new PointerEvent('pointerdown', { button: 2, clientX: 100, clientY: 100, bubbles: true }),
    )

    expect(store.getState().location.isFollowingUser).toBe(false)
  })
})

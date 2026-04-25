import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import authReducer from '@/slices/authSlice'
import storesReducer from '@/slices/storesSlice'
import mapReducer from '@/slices/mapSlice'
import uiReducer from '@/slices/uiSlice'
import AppTabs from './AppTabs'
import * as useIsMobileModule from './useIsMobile'

vi.mock('maplibre-gl', () => ({
  default: {
    Map: vi.fn().mockImplementation(() => ({
      remove: vi.fn(),
      on: vi.fn(),
      getCenter: vi.fn().mockReturnValue({ lng: -53.45528, lat: -24.95583 }),
      getZoom: vi.fn().mockReturnValue(12),
      getBearing: vi.fn().mockReturnValue(0),
      getPitch: vi.fn().mockReturnValue(45),
      setBearing: vi.fn(),
      setPitch: vi.fn(),
      panBy: vi.fn(),
      flyTo: vi.fn(),
      easeTo: vi.fn(),
      dragPan: { enable: vi.fn(), disable: vi.fn() },
      dragRotate: { enable: vi.fn(), disable: vi.fn() },
      addControl: vi.fn(),
    })),
    Marker: vi.fn().mockImplementation(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      setPopup: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn(),
      togglePopup: vi.fn(),
    })),
    Popup: vi.fn().mockImplementation(() => ({
      setDOMContent: vi.fn().mockReturnThis(),
    })),
    AttributionControl: vi.fn().mockImplementation(() => ({})),
  },
}))

vi.mock('@/components/MapView/useMapMarkers', () => ({
  useMapMarkers: vi.fn(() => ({
    panToMarker: vi.fn(),
    openMarkerPopup: vi.fn(),
  })),
}))

function makeTestStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      stores: storesReducer,
      map: mapReducer,
      ui: uiReducer,
    },
    preloadedState: {
      stores: {
        items: [],
        categories: [],
        categoryMap: {},
        status: 'succeeded' as const,
        error: null,
        searchQuery: '',
        selectedCategoryId: null,
        page: 1,
        pageSize: 20,
        hasMore: false,
      },
    },
  })
}

function setup(path = '/map') {
  const testStore = makeTestStore()
  const result = render(
    <Provider store={testStore}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/*" element={<AppTabs />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
  return { store: testStore, ...result }
}

describe('AppTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  describe('mobile layout', () => {
    beforeEach(() => {
      vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(true)
    })

    it('renders tab bar on mobile', () => {
      const { container } = setup()
      expect(container.querySelector('ion-tab-bar')).not.toBeNull()
    })

    it('renders Map tab button', () => {
      const { container } = setup()
      expect(container.querySelector('ion-tab-button[tab="map"]')).not.toBeNull()
    })

    it('renders Explore tab button', () => {
      const { container } = setup()
      expect(container.querySelector('ion-tab-button[tab="explore"]')).not.toBeNull()
    })

    it('marks the active tab as selected based on current path', () => {
      const { container } = setup('/map')
      const mapBtn = container.querySelector('ion-tab-button[tab="map"]')
      expect(mapBtn?.getAttribute('selected')).toBe('true')
    })

    it('marks explore tab as selected when on /explore path', () => {
      const { container } = setup('/explore')
      const exploreBtn = container.querySelector('ion-tab-button[tab="explore"]')
      expect(exploreBtn?.getAttribute('selected')).toBe('true')
    })
  })

  describe('desktop layout', () => {
    beforeEach(() => {
      vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(false)
    })

    it('does not render tab bar on desktop', () => {
      const { container } = setup()
      expect(container.querySelector('ion-tab-bar')).toBeNull()
    })
  })
})

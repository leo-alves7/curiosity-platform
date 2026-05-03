import '@/i18n/index'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/slices/authSlice'
import storesReducer from '@/slices/storesSlice'
import mapReducer from '@/slices/mapSlice'
import locationReducer from '@/slices/locationSlice'
import uiReducer from '@/slices/uiSlice'
import settingsReducer from '@/slices/settingsSlice'
import MapPage from './MapPage'
import type { StoreResponse } from '@/types/store'
import * as useIsMobileModule from '@/components/AppTabs/useIsMobile'

vi.mock('@/components/Layout/AppHeader', () => ({ default: () => null }))

vi.mock('maplibre-gl', () => ({
  default: {
    Map: vi.fn().mockImplementation(() => ({
      remove: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      getCanvas: vi.fn().mockReturnValue({ style: { cursor: '' } }),
      addControl: vi.fn(),
      getCenter: vi.fn().mockReturnValue({ lng: -53.45528, lat: -24.95583 }),
      getZoom: vi.fn().mockReturnValue(12),
      getBearing: vi.fn().mockReturnValue(0),
      getPitch: vi.fn().mockReturnValue(45),
      setBearing: vi.fn(),
      setPitch: vi.fn(),
      panBy: vi.fn(),
      flyTo: vi.fn(),
      easeTo: vi.fn(),
      resize: vi.fn(),
      setStyle: vi.fn(),
      dragPan: { enable: vi.fn(), disable: vi.fn() },
      dragRotate: { enable: vi.fn(), disable: vi.fn() },
    })),
    AttributionControl: vi.fn().mockImplementation(() => ({})),
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
  },
}))

vi.mock('@/features/map/useMapMarkers', () => ({
  useMapMarkers: vi.fn(() => ({
    panToMarker: vi.fn(),
    openMarkerPopup: vi.fn(),
  })),
}))

vi.mock('@/hooks/useUserLocation', () => ({
  useUserLocation: vi.fn(),
}))

vi.mock('@/features/map/UserLocationLayer', () => ({
  default: vi.fn().mockReturnValue(null),
}))

vi.mock('@/features/map/LocateMeFab', () => ({
  default: vi.fn().mockReturnValue(null),
}))

function makeStore(overrides: Partial<StoreResponse> = {}): StoreResponse {
  return {
    id: 'store-1',
    name: 'Alpha Store',
    description: null,
    address: '1 Main St',
    lat: 0,
    lng: 0,
    category_id: 'cat-1',
    image_url: null,
    is_active: true,
    created_at: '',
    updated_at: '',
    ...overrides,
  }
}

interface SetupOpts {
  items?: StoreResponse[]
  categoryMap?: Record<string, string>
  status?: 'idle' | 'loading' | 'succeeded' | 'failed'
  isPanelOpen?: boolean
  isAddingStore?: boolean
  pinLocation?: { lat: number; lng: number } | null
  isSidebarCollapsed?: boolean
}

function setup(opts: SetupOpts = {}) {
  const testStore = configureStore({
    reducer: {
      auth: authReducer,
      stores: storesReducer,
      map: mapReducer,
      location: locationReducer,
      ui: uiReducer,
      settings: settingsReducer,
    },
    preloadedState: {
      auth: {
        isAuthenticated: false,
        uid: null,
        email: null,
        isAdmin: false,
        displayName: null,
        photoURL: null,
      },
      stores: {
        items: opts.items ?? [],
        categories: [],
        categoryMap: opts.categoryMap ?? {},
        status: opts.status ?? 'succeeded',
        error: null,
        searchQuery: '',
        selectedCategoryId: null,
        page: 1,
        pageSize: 20,
        hasMore: false,
      },
      ui: {
        isPanelOpen: opts.isPanelOpen ?? true,
        isAddingStore: opts.isAddingStore ?? false,
        pinLocation: opts.pinLocation ?? null,
        isSidebarCollapsed: opts.isSidebarCollapsed ?? false,
      },
      settings: { theme: 'system' as const, language: null as null },
    },
  })
  const result = render(
    <Provider store={testStore}>
      <MapPage />
    </Provider>,
  )
  return { store: testStore, ...result }
}

describe('MapPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  describe('desktop layout', () => {
    beforeEach(() => {
      vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(false)
    })

    it('renders without crashing', () => {
      const { container } = setup()
      expect(container).toBeDefined()
    })

    it('renders both the store list panel and the map container', () => {
      const { container } = setup({
        items: [makeStore({ id: '1', name: 'Alpha Store' })],
        categoryMap: { 'cat-1': 'Food' },
      })
      expect(screen.getByText('Stores')).toBeDefined()
      expect(screen.getByText('Alpha Store')).toBeDefined()
      expect(container.querySelectorAll('div').length).toBeGreaterThan(0)
    })

    it('opens the store detail view when a store card is clicked', async () => {
      setup({
        items: [makeStore({ id: 'abc', name: 'Clickable' })],
      })
      const user = userEvent.setup()
      await user.click(screen.getByText('Clickable'))
      const modal = document.body.querySelector('ion-modal')
      expect(modal).not.toBeNull()
    })

    it('does not render the toggle FAB on desktop', () => {
      const { container } = setup()
      expect(container.querySelector('[aria-label="Toggle store list"]')).toBeNull()
    })

    it('collapses sidebar when isSidebarCollapsed is true', () => {
      const { container } = setup({ isSidebarCollapsed: true })
      const gridDiv = container.querySelector('div[style*="grid"]') as HTMLElement
      expect(gridDiv).not.toBeNull()
      expect(gridDiv.style.gridTemplateColumns).toContain('0fr')
    })
  })

  describe('mobile layout', () => {
    beforeEach(() => {
      vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(true)
    })

    it('renders MapView full-screen without left panel', () => {
      setup()
      expect(screen.queryByText('Stores')).toBeNull()
    })

    it('renders the toggle FAB on mobile', () => {
      const { container } = setup()
      expect(container.querySelector('[aria-label="Toggle store list"]')).not.toBeNull()
    })

    it('dispatches togglePanel when FAB is clicked', async () => {
      const { store } = setup({ isPanelOpen: false })
      const user = userEvent.setup()
      const fab = screen.getByLabelText('Toggle store list')
      await user.click(fab)
      expect(store.getState().ui.isPanelOpen).toBe(true)
    })

    it('renders panel modal when isPanelOpen is true', () => {
      const { container } = setup({ isPanelOpen: true })
      const modals = container.querySelectorAll('ion-modal')
      expect(modals.length).toBeGreaterThan(0)
    })
  })

  describe('add store flow', () => {
    beforeEach(() => {
      vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(false)
    })

    it('renders the AddStoreButton', () => {
      setup()
      expect(screen.getByLabelText('Add store')).toBeDefined()
    })

    it('toggles isAddingStore in Redux when AddStoreButton is clicked', async () => {
      const { store } = setup()
      const user = userEvent.setup()
      await user.click(screen.getByLabelText('Add store'))
      expect(store.getState().ui.isAddingStore).toBe(true)
    })

    it('clears add-store state when the cancel variant is clicked', async () => {
      const { store } = setup({ isAddingStore: true, pinLocation: { lat: 1, lng: 2 } })
      const user = userEvent.setup()
      await user.click(screen.getByLabelText('Cancel adding store'))
      expect(store.getState().ui.isAddingStore).toBe(false)
      expect(store.getState().ui.pinLocation).toBeNull()
    })
  })
})

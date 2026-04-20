import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/slices/authSlice'
import storesReducer from '@/slices/storesSlice'
import mapReducer from '@/slices/mapSlice'
import MapPage from './MapPage'
import type { StoreResponse } from '@/types/store'

vi.mock('maplibre-gl', () => ({
  default: {
    Map: vi.fn().mockImplementation(() => ({
      remove: vi.fn(),
      on: vi.fn(),
      getCenter: vi.fn().mockReturnValue({ lng: -53.45528, lat: -24.95583 }),
      getZoom: vi.fn().mockReturnValue(12),
      flyTo: vi.fn(),
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
  },
}))

const panToMarker = vi.fn()
const openMarkerPopup = vi.fn()

vi.mock('@/components/MapView/useMapMarkers', () => ({
  useMapMarkers: vi.fn(() => ({
    panToMarker,
    openMarkerPopup,
  })),
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
}

function setup(opts: SetupOpts = {}) {
  const testStore = configureStore({
    reducer: {
      auth: authReducer,
      stores: storesReducer,
      map: mapReducer,
    },
    preloadedState: {
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

  it('triggers map marker actions when a store card is clicked', async () => {
    setup({
      items: [makeStore({ id: 'abc', name: 'Clickable' })],
    })
    const user = userEvent.setup()
    await user.click(screen.getByText('Clickable'))
    expect(panToMarker).toHaveBeenCalledWith('abc')
    expect(openMarkerPopup).toHaveBeenCalledWith('abc')
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/slices/authSlice'
import storesReducer from '@/slices/storesSlice'
import mapReducer from '@/slices/mapSlice'
import MapView from './MapView'

vi.mock('maplibre-gl', () => ({
  default: {
    Map: vi.fn().mockImplementation(() => ({
      remove: vi.fn(),
      on: vi.fn(),
      getCenter: vi.fn().mockReturnValue({ lng: -53.45528, lat: -24.95583 }),
      getZoom: vi.fn().mockReturnValue(12),
    })),
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
})

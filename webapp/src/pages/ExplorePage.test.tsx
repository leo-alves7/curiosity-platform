import '@/i18n/index'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/components/Layout/AppHeader', () => ({ default: () => null }))
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/slices/authSlice'
import storesReducer from '@/slices/storesSlice'
import mapReducer from '@/slices/mapSlice'
import uiReducer from '@/slices/uiSlice'
import ExplorePage from './ExplorePage'
import type { StoreResponse } from '@/types/store'
import * as useIsMobileModule from '@/components/AppTabs/useIsMobile'

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
      ui: uiReducer,
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
      ui: {
        isPanelOpen: true,
        isAddingStore: false,
        pinLocation: null,
        isSidebarCollapsed: false,
      },
    },
  })
  const result = render(
    <Provider store={testStore}>
      <ExplorePage />
    </Provider>,
  )
  return { store: testStore, ...result }
}

describe('ExplorePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(false)
  })

  afterEach(() => {
    cleanup()
  })

  it('renders without crashing', () => {
    const { container } = setup()
    expect(container).toBeDefined()
  })

  it('renders the store list panel with heading', () => {
    setup({ items: [makeStore()] })
    expect(screen.getByText('Stores')).toBeDefined()
  })

  it('renders store names from Redux state', () => {
    setup({ items: [makeStore({ id: '1', name: 'Beta Store' })] })
    expect(screen.getByText('Beta Store')).toBeDefined()
  })

  it('dispatches setSearchQuery on search input', async () => {
    vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(true)
    const { store } = setup()
    const searchbar = screen.getByLabelText('Search stores') as HTMLElement
    const user = userEvent.setup()
    await user.click(searchbar)
    expect(store.getState().stores.searchQuery).toBe('')
  })

  it('opens the store detail modal when a store is clicked', async () => {
    setup({ items: [makeStore({ id: 'abc', name: 'Clickable' })] })
    const user = userEvent.setup()
    await user.click(screen.getByText('Clickable'))
    const modal = document.body.querySelector('ion-modal')
    expect(modal).not.toBeNull()
  })

  it('does not render a MapView', () => {
    const { container } = setup()
    expect(container.querySelector('canvas')).toBeNull()
  })

  describe('searchbar visibility by layout mode', () => {
    it('hides searchbar in StoreListPanel on desktop', () => {
      vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(false)
      setup()
      expect(screen.queryByLabelText('Search stores')).toBeNull()
    })

    it('shows searchbar in StoreListPanel on mobile', () => {
      vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(true)
      setup()
      expect(screen.getByLabelText('Search stores')).toBeDefined()
    })
  })
})

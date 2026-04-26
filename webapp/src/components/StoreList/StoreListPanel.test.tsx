import '@/i18n/index'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@/slices/uiSlice'
import StoreListPanel from './StoreListPanel'
import type { CategoryResponse } from '@/types/category'
import type { StoreResponse } from '@/types/store'

function makeStore(overrides: Partial<StoreResponse> = {}): StoreResponse {
  return {
    id: 'store-1',
    name: 'Store One',
    description: null,
    address: '123 Main St',
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

const mockCategories: CategoryResponse[] = [
  {
    id: 'cat-1',
    name: 'Food',
    slug: 'food',
    icon: null,
    color: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'cat-2',
    name: 'Books',
    slug: 'books',
    icon: null,
    color: null,
    created_at: '',
    updated_at: '',
  },
]

interface SetupOpts {
  filteredStores?: StoreResponse[]
  categories?: CategoryResponse[]
  categoryMap?: Record<string, string>
  status?: 'idle' | 'loading' | 'succeeded' | 'failed'
  error?: string | null
  searchQuery?: string
  selectedCategoryId?: string | null
  hasMore?: boolean
  isMobile?: boolean
  isPanelOpen?: boolean
}

function setup(opts: SetupOpts = {}) {
  const testStore = configureStore({
    reducer: { ui: uiReducer },
    preloadedState: {
      ui: { isPanelOpen: opts.isPanelOpen ?? true, isAddingStore: false, pinLocation: null },
    },
  })
  const onSearchChange = vi.fn()
  const onCategoryChange = vi.fn()
  const onLoadMore = vi.fn()
  const onStoreClick = vi.fn()
  const result = render(
    <Provider store={testStore}>
      <StoreListPanel
        filteredStores={opts.filteredStores ?? [makeStore()]}
        categories={opts.categories ?? mockCategories}
        categoryMap={opts.categoryMap ?? { 'cat-1': 'Food', 'cat-2': 'Books' }}
        status={opts.status ?? 'succeeded'}
        error={opts.error ?? null}
        searchQuery={opts.searchQuery ?? ''}
        selectedCategoryId={opts.selectedCategoryId ?? null}
        hasMore={opts.hasMore ?? false}
        isMobile={opts.isMobile}
        onSearchChange={onSearchChange}
        onCategoryChange={onCategoryChange}
        onLoadMore={onLoadMore}
        onStoreClick={onStoreClick}
      />
    </Provider>,
  )
  return { testStore, onSearchChange, onCategoryChange, onLoadMore, onStoreClick, ...result }
}

describe('StoreListPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('renders the Stores heading', () => {
    setup()
    expect(screen.getByText('Stores')).toBeDefined()
  })

  it('renders the search bar', () => {
    setup()
    expect(screen.getByLabelText('Search stores')).toBeDefined()
  })

  it('debounces onSearchChange until delay elapses', () => {
    const { onSearchChange } = setup({ searchQuery: '' })
    const searchbar = screen.getByLabelText('Search stores') as HTMLElement

    act(() => {
      fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: 'burger' } }))
    })

    expect(onSearchChange).not.toHaveBeenCalledWith('burger')

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(onSearchChange).toHaveBeenCalledWith('burger')
  })

  it('cancels debounced call if value changes before delay', () => {
    const { onSearchChange } = setup({ searchQuery: '' })
    const searchbar = screen.getByLabelText('Search stores') as HTMLElement

    act(() => {
      fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: 'bur' } }))
    })
    act(() => {
      vi.advanceTimersByTime(150)
    })
    act(() => {
      fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: 'burger' } }))
    })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(onSearchChange).toHaveBeenCalledWith('burger')
    expect(onSearchChange).not.toHaveBeenCalledWith('bur')
  })

  it('calls onCategoryChange with null when All is selected', () => {
    const { onCategoryChange, container } = setup({ selectedCategoryId: 'cat-1' })
    const segment = container.querySelector('ion-segment') as HTMLElement
    act(() => {
      fireEvent(segment, new CustomEvent('ionChange', { detail: { value: '__all__' } }))
    })
    expect(onCategoryChange).toHaveBeenCalledWith(null)
  })

  it('calls onCategoryChange with category id when a category is selected', () => {
    const { onCategoryChange, container } = setup()
    const segment = container.querySelector('ion-segment') as HTMLElement
    act(() => {
      fireEvent(segment, new CustomEvent('ionChange', { detail: { value: 'cat-2' } }))
    })
    expect(onCategoryChange).toHaveBeenCalledWith('cat-2')
  })

  it('renders the filtered stores list', () => {
    setup({ filteredStores: [makeStore({ id: '1', name: 'Alpha' })] })
    expect(screen.getByText('Alpha')).toBeDefined()
  })

  it('hides the segment control when there are no categories', () => {
    const { container } = setup({ categories: [] })
    expect(container.querySelector('ion-segment')).toBeNull()
  })

  describe('close button', () => {
    it('renders close button when isMobile is true', () => {
      setup({ isMobile: true })
      expect(screen.getByLabelText('Close panel')).toBeDefined()
    })

    it('does not render close button when isMobile is false', () => {
      setup({ isMobile: false })
      expect(screen.queryByLabelText('Close panel')).toBeNull()
    })

    it('does not render close button when isMobile is undefined', () => {
      setup()
      expect(screen.queryByLabelText('Close panel')).toBeNull()
    })

    it('dispatches togglePanel when close button is clicked', async () => {
      vi.useRealTimers()
      const { testStore } = setup({ isMobile: true, isPanelOpen: true })
      const user = userEvent.setup()
      const closeButton = screen.getByLabelText('Close panel')
      await user.click(closeButton)
      expect(testStore.getState().ui.isPanelOpen).toBe(false)
    })
  })
})

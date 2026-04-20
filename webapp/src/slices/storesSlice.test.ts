import { describe, it, expect } from 'vitest'
import storesReducer, {
  fetchStoresAndCategories,
  setSearchQuery,
  setSelectedCategory,
  setPage,
  resetFilters,
  selectFilteredStores,
  selectPaginatedFilteredStores,
} from './storesSlice'
import type { CategoryResponse } from '@/types/category'
import type { StoreResponse } from '@/types/store'

interface StoresStateForTest {
  items: StoreResponse[]
  categories: CategoryResponse[]
  categoryMap: Record<string, string>
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  searchQuery: string
  selectedCategoryId: string | null
  page: number
  pageSize: number
  hasMore: boolean
}

const initialState: StoresStateForTest = {
  items: [],
  categories: [],
  categoryMap: {},
  status: 'idle',
  error: null,
  searchQuery: '',
  selectedCategoryId: null,
  page: 1,
  pageSize: 20,
  hasMore: false,
}

function makeStore(overrides: Partial<StoreResponse> = {}): StoreResponse {
  return {
    id: 'store-1',
    name: 'Default Store',
    description: null,
    address: null,
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

describe('storesSlice reducer', () => {
  it('returns initial state', () => {
    expect(storesReducer(undefined, { type: '@@INIT' })).toEqual(initialState)
  })

  it('sets status to loading on pending', () => {
    const state = storesReducer(initialState, fetchStoresAndCategories.pending('', undefined))
    expect(state.status).toBe('loading')
    expect(state.error).toBeNull()
  })

  it('sets items, categories and categoryMap on fulfilled', () => {
    const payload = {
      items: [makeStore()],
      categories: [],
      categoryMap: { 'cat-1': 'Food' },
    }
    const state = storesReducer(
      { ...initialState, status: 'loading' },
      fetchStoresAndCategories.fulfilled(payload, '', undefined),
    )
    expect(state.status).toBe('succeeded')
    expect(state.items).toEqual(payload.items)
    expect(state.categoryMap).toEqual(payload.categoryMap)
  })

  it('sets hasMore=true when items exceed page*pageSize', () => {
    const items = Array.from({ length: 25 }, (_, i) => makeStore({ id: `s-${i}` }))
    const state = storesReducer(
      { ...initialState, status: 'loading' },
      fetchStoresAndCategories.fulfilled({ items, categories: [], categoryMap: {} }, '', undefined),
    )
    expect(state.hasMore).toBe(true)
  })

  it('sets hasMore=false when items fit in first page', () => {
    const items = [makeStore()]
    const state = storesReducer(
      { ...initialState, status: 'loading' },
      fetchStoresAndCategories.fulfilled({ items, categories: [], categoryMap: {} }, '', undefined),
    )
    expect(state.hasMore).toBe(false)
  })

  it('sets error on rejected', () => {
    const state = storesReducer(
      { ...initialState, status: 'loading' },
      fetchStoresAndCategories.rejected(new Error('Network error'), '', undefined),
    )
    expect(state.status).toBe('failed')
    expect(state.error).toBe('Network error')
  })

  it('falls back to default error message when error has no message', () => {
    const action = fetchStoresAndCategories.rejected(new Error(''), '', undefined)
    const state = storesReducer({ ...initialState, status: 'loading' }, action)
    expect(state.error).toBe('Failed to load stores')
  })

  it('setSearchQuery updates query and resets page to 1', () => {
    const state = storesReducer({ ...initialState, page: 3 }, setSearchQuery('burger'))
    expect(state.searchQuery).toBe('burger')
    expect(state.page).toBe(1)
  })

  it('setSelectedCategory updates category and resets page to 1', () => {
    const state = storesReducer({ ...initialState, page: 3 }, setSelectedCategory('cat-2'))
    expect(state.selectedCategoryId).toBe('cat-2')
    expect(state.page).toBe(1)
  })

  it('setSelectedCategory accepts null to clear filter', () => {
    const state = storesReducer(
      { ...initialState, selectedCategoryId: 'cat-1' },
      setSelectedCategory(null),
    )
    expect(state.selectedCategoryId).toBeNull()
  })

  it('setPage updates page', () => {
    const state = storesReducer(initialState, setPage(4))
    expect(state.page).toBe(4)
  })

  it('resetFilters clears query, category, and page', () => {
    const state = storesReducer(
      {
        ...initialState,
        searchQuery: 'abc',
        selectedCategoryId: 'cat-1',
        page: 5,
      },
      resetFilters(),
    )
    expect(state.searchQuery).toBe('')
    expect(state.selectedCategoryId).toBeNull()
    expect(state.page).toBe(1)
  })
})

describe('selectFilteredStores', () => {
  const items = [
    makeStore({ id: '1', name: 'Burger Palace', category_id: 'food' }),
    makeStore({ id: '2', name: 'Taco Town', category_id: 'food' }),
    makeStore({ id: '3', name: 'Bookstore', category_id: 'books' }),
    makeStore({ id: '4', name: 'Burger Shack', category_id: 'food' }),
  ]

  function stateWith(overrides: Partial<typeof initialState> = {}) {
    return { stores: { ...initialState, items, ...overrides } }
  }

  it('returns all stores when no filters are set', () => {
    expect(selectFilteredStores(stateWith())).toEqual(items)
  })

  it('filters by case-insensitive partial name match', () => {
    const result = selectFilteredStores(stateWith({ searchQuery: 'burger' }))
    expect(result.map((s) => s.id)).toEqual(['1', '4'])
  })

  it('filters by category id', () => {
    const result = selectFilteredStores(stateWith({ selectedCategoryId: 'books' }))
    expect(result.map((s) => s.id)).toEqual(['3'])
  })

  it('applies name and category filters simultaneously', () => {
    const result = selectFilteredStores(
      stateWith({ searchQuery: 'burger', selectedCategoryId: 'food' }),
    )
    expect(result.map((s) => s.id)).toEqual(['1', '4'])
  })

  it('ignores whitespace-only search queries', () => {
    const result = selectFilteredStores(stateWith({ searchQuery: '   ' }))
    expect(result).toEqual(items)
  })

  it('returns empty array when no stores match', () => {
    const result = selectFilteredStores(stateWith({ searchQuery: 'xyzxyz' }))
    expect(result).toEqual([])
  })

  it('is memoized - returns same reference for same state', () => {
    const state = stateWith({ searchQuery: 'burger' })
    const a = selectFilteredStores(state)
    const b = selectFilteredStores(state)
    expect(a).toBe(b)
  })
})

describe('selectPaginatedFilteredStores', () => {
  const items = Array.from({ length: 50 }, (_, i) =>
    makeStore({ id: `s-${i}`, name: `Store ${i}` }),
  )

  function stateWith(overrides: Partial<typeof initialState> = {}) {
    return { stores: { ...initialState, items, ...overrides } }
  }

  it('returns first page when page=1', () => {
    const result = selectPaginatedFilteredStores(stateWith({ page: 1, pageSize: 20 }))
    expect(result).toHaveLength(20)
  })

  it('returns accumulated pages when page>1', () => {
    const result = selectPaginatedFilteredStores(stateWith({ page: 2, pageSize: 20 }))
    expect(result).toHaveLength(40)
  })

  it('returns all filtered items when page size exceeds results', () => {
    const result = selectPaginatedFilteredStores(stateWith({ page: 10, pageSize: 20 }))
    expect(result).toHaveLength(50)
  })
})

import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { fetchStores } from '@/api/stores'
import { fetchCategories } from '@/api/categories'
import type { CategoryResponse } from '@/types/category'
import type { StoreResponse } from '@/types/store'

interface StoresState {
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

const DEFAULT_PAGE_SIZE = 20

const initialState: StoresState = {
  items: [],
  categories: [],
  categoryMap: {},
  status: 'idle',
  error: null,
  searchQuery: '',
  selectedCategoryId: null,
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  hasMore: false,
}

export const fetchStoresAndCategories = createAsyncThunk(
  'stores/fetchStoresAndCategories',
  async () => {
    const [storesData, categories] = await Promise.all([fetchStores(), fetchCategories()])
    const categoryMap = categories.reduce<Record<string, string>>((acc, cat) => {
      acc[cat.id] = cat.name
      return acc
    }, {})
    return { items: storesData.items, categories, categoryMap }
  },
)

const storesSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
      state.page = 1
    },
    setSelectedCategory(state, action: PayloadAction<string | null>) {
      state.selectedCategoryId = action.payload
      state.page = 1
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload
    },
    resetFilters(state) {
      state.searchQuery = ''
      state.selectedCategoryId = null
      state.page = 1
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoresAndCategories.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchStoresAndCategories.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.categories = action.payload.categories
        state.categoryMap = action.payload.categoryMap
        state.hasMore = action.payload.items.length > state.page * state.pageSize
      })
      .addCase(fetchStoresAndCategories.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to load stores'
      })
  },
})

export const { setSearchQuery, setSelectedCategory, setPage, resetFilters } = storesSlice.actions

export const selectStores = (state: { stores: StoresState }) => state.stores.items
export const selectCategories = (state: { stores: StoresState }) => state.stores.categories
export const selectCategoryMap = (state: { stores: StoresState }) => state.stores.categoryMap
export const selectStoresStatus = (state: { stores: StoresState }) => state.stores.status
export const selectStoresError = (state: { stores: StoresState }) => state.stores.error
export const selectSearchQuery = (state: { stores: StoresState }) => state.stores.searchQuery
export const selectSelectedCategory = (state: { stores: StoresState }) =>
  state.stores.selectedCategoryId
export const selectPage = (state: { stores: StoresState }) => state.stores.page
export const selectPageSize = (state: { stores: StoresState }) => state.stores.pageSize
export const selectHasMore = (state: { stores: StoresState }) => state.stores.hasMore

export const selectFilteredStores = createSelector(
  [selectStores, selectSearchQuery, selectSelectedCategory],
  (items, searchQuery, selectedCategoryId) => {
    const query = searchQuery.trim().toLowerCase()
    return items.filter((store) => {
      if (selectedCategoryId && store.category_id !== selectedCategoryId) {
        return false
      }
      if (query && !store.name.toLowerCase().includes(query)) {
        return false
      }
      return true
    })
  },
)

export const selectPaginatedFilteredStores = createSelector(
  [selectFilteredStores, selectPage, selectPageSize],
  (filtered, page, pageSize) => filtered.slice(0, page * pageSize),
)

export default storesSlice.reducer

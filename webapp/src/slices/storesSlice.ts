import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchStores } from '@/api/stores'
import { fetchCategories } from '@/api/categories'
import type { StoreResponse } from '@/types/store'

interface StoresState {
  items: StoreResponse[]
  categoryMap: Record<string, string>
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: StoresState = {
  items: [],
  categoryMap: {},
  status: 'idle',
  error: null,
}

export const fetchStoresAndCategories = createAsyncThunk(
  'stores/fetchStoresAndCategories',
  async () => {
    const [storesData, categories] = await Promise.all([fetchStores(), fetchCategories()])
    const categoryMap = categories.reduce<Record<string, string>>((acc, cat) => {
      acc[cat.id] = cat.name
      return acc
    }, {})
    return { items: storesData.items, categoryMap }
  },
)

const storesSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoresAndCategories.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchStoresAndCategories.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.categoryMap = action.payload.categoryMap
      })
      .addCase(fetchStoresAndCategories.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to load stores'
      })
  },
})

export const selectStores = (state: { stores: StoresState }) => state.stores.items
export const selectCategoryMap = (state: { stores: StoresState }) => state.stores.categoryMap
export const selectStoresStatus = (state: { stores: StoresState }) => state.stores.status
export const selectStoresError = (state: { stores: StoresState }) => state.stores.error

export default storesSlice.reducer

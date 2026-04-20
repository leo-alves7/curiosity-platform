import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  createStore,
  updateStore,
  deleteStore,
  uploadStoreImage,
  fetchAdminStores,
  toggleStoreActive,
} from '@/api/stores'
import { createCategory, updateCategory, deleteCategory, fetchCategories } from '@/api/categories'
import type { StoreResponse, StoreCreate, StoreUpdate, PaginatedStores } from '@/types/store'
import type { CategoryResponse, CategoryCreate, CategoryUpdate } from '@/types/category'

interface AdminState {
  stores: StoreResponse[]
  categories: CategoryResponse[]
  selectedStore: StoreResponse | null
  selectedCategory: CategoryResponse | null
  storeForm: { isOpen: boolean; mode: 'create' | 'edit' }
  categoryForm: { isOpen: boolean; mode: 'create' | 'edit' }
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: AdminState = {
  stores: [],
  categories: [],
  selectedStore: null,
  selectedCategory: null,
  storeForm: { isOpen: false, mode: 'create' },
  categoryForm: { isOpen: false, mode: 'create' },
  status: 'idle',
  error: null,
}

export const fetchAdminStoresThunk = createAsyncThunk(
  'admin/fetchStores',
  async (): Promise<PaginatedStores> => fetchAdminStores(),
)

export const createStoreThunk = createAsyncThunk(
  'admin/createStore',
  async (data: StoreCreate): Promise<StoreResponse> => createStore(data),
)

export const updateStoreThunk = createAsyncThunk(
  'admin/updateStore',
  async ({ id, data }: { id: string; data: StoreUpdate }): Promise<StoreResponse> =>
    updateStore(id, data),
)

export const deleteStoreThunk = createAsyncThunk(
  'admin/deleteStore',
  async (id: string): Promise<string> => {
    await deleteStore(id)
    return id
  },
)

export const uploadStoreImageThunk = createAsyncThunk(
  'admin/uploadStoreImage',
  async ({ id, file }: { id: string; file: File }): Promise<StoreResponse> =>
    uploadStoreImage(id, file),
)

export const toggleStoreActiveThunk = createAsyncThunk(
  'admin/toggleStoreActive',
  async (id: string): Promise<StoreResponse> => toggleStoreActive(id),
)

export const fetchAdminCategoriesThunk = createAsyncThunk(
  'admin/fetchCategories',
  async (): Promise<CategoryResponse[]> => fetchCategories(),
)

export const createCategoryThunk = createAsyncThunk(
  'admin/createCategory',
  async (data: CategoryCreate): Promise<CategoryResponse> => createCategory(data),
)

export const updateCategoryThunk = createAsyncThunk(
  'admin/updateCategory',
  async ({ id, data }: { id: string; data: CategoryUpdate }): Promise<CategoryResponse> =>
    updateCategory(id, data),
)

export const deleteCategoryThunk = createAsyncThunk(
  'admin/deleteCategory',
  async (id: string): Promise<string> => {
    await deleteCategory(id)
    return id
  },
)

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    openStoreForm(state, action: PayloadAction<'create' | 'edit'>) {
      state.storeForm = { isOpen: true, mode: action.payload }
    },
    closeStoreForm(state) {
      state.storeForm.isOpen = false
      if (state.storeForm.mode === 'create') {
        state.selectedStore = null
      }
    },
    setSelectedStore(state, action: PayloadAction<StoreResponse | null>) {
      state.selectedStore = action.payload
    },
    openCategoryForm(state, action: PayloadAction<'create' | 'edit'>) {
      state.categoryForm = { isOpen: true, mode: action.payload }
    },
    closeCategoryForm(state) {
      state.categoryForm.isOpen = false
      if (state.categoryForm.mode === 'create') {
        state.selectedCategory = null
      }
    },
    setSelectedCategory(state, action: PayloadAction<CategoryResponse | null>) {
      state.selectedCategory = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStoresThunk.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchAdminStoresThunk.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.stores = action.payload.items
      })
      .addCase(fetchAdminStoresThunk.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Failed to load stores'
      })
      .addCase(createStoreThunk.fulfilled, (state, action) => {
        state.stores.unshift(action.payload)
        state.storeForm.isOpen = false
      })
      .addCase(updateStoreThunk.fulfilled, (state, action) => {
        const idx = state.stores.findIndex((s) => s.id === action.payload.id)
        if (idx !== -1) state.stores[idx] = action.payload
        state.storeForm.isOpen = false
      })
      .addCase(deleteStoreThunk.fulfilled, (state, action) => {
        state.stores = state.stores.filter((s) => s.id !== action.payload)
      })
      .addCase(uploadStoreImageThunk.fulfilled, (state, action) => {
        const idx = state.stores.findIndex((s) => s.id === action.payload.id)
        if (idx !== -1) state.stores[idx] = action.payload
      })
      .addCase(toggleStoreActiveThunk.fulfilled, (state, action) => {
        const idx = state.stores.findIndex((s) => s.id === action.payload.id)
        if (idx !== -1) state.stores[idx] = action.payload
      })
      .addCase(fetchAdminCategoriesThunk.fulfilled, (state, action) => {
        state.categories = action.payload
      })
      .addCase(createCategoryThunk.fulfilled, (state, action) => {
        state.categories.unshift(action.payload)
        state.categoryForm.isOpen = false
      })
      .addCase(updateCategoryThunk.fulfilled, (state, action) => {
        const idx = state.categories.findIndex((c) => c.id === action.payload.id)
        if (idx !== -1) state.categories[idx] = action.payload
        state.categoryForm.isOpen = false
      })
      .addCase(deleteCategoryThunk.fulfilled, (state, action) => {
        state.categories = state.categories.filter((c) => c.id !== action.payload)
      })
  },
})

export const {
  openStoreForm,
  closeStoreForm,
  setSelectedStore,
  openCategoryForm,
  closeCategoryForm,
  setSelectedCategory,
} = adminSlice.actions

export default adminSlice.reducer

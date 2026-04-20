import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import storesReducer from './slices/storesSlice'
import mapReducer from './slices/mapSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    stores: storesReducer,
    map: mapReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

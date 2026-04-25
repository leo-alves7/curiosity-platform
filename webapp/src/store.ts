import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import storesReducer from './slices/storesSlice'
import mapReducer from './slices/mapSlice'
import adminReducer from './slices/adminSlice'
import locationReducer from './slices/locationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    stores: storesReducer,
    map: mapReducer,
    admin: adminReducer,
    location: locationReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

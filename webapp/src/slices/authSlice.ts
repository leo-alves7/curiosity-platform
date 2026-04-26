import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  isAuthenticated: boolean
  uid: string | null
  email: string | null
  isAdmin: boolean
  displayName: string | null
  photoURL: string | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  uid: null,
  email: null,
  isAdmin: false,
  displayName: null,
  photoURL: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(
      state,
      action: PayloadAction<{
        uid: string
        email: string
        isAdmin?: boolean
        displayName?: string | null
        photoURL?: string | null
      }>,
    ) {
      state.isAuthenticated = true
      state.uid = action.payload.uid
      state.email = action.payload.email
      state.isAdmin = action.payload.isAdmin ?? false
      state.displayName = action.payload.displayName ?? null
      state.photoURL = action.payload.photoURL ?? null
    },
    clearAuth(state) {
      state.isAuthenticated = false
      state.uid = null
      state.email = null
      state.isAdmin = false
      state.displayName = null
      state.photoURL = null
    },
  },
})

export const { setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer

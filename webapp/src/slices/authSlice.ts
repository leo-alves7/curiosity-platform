import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  isAuthenticated: boolean
  uid: string | null
  email: string | null
  isAdmin: boolean
}

const initialState: AuthState = {
  isAuthenticated: false,
  uid: null,
  email: null,
  isAdmin: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ uid: string; email: string; isAdmin?: boolean }>) {
      state.isAuthenticated = true
      state.uid = action.payload.uid
      state.email = action.payload.email
      state.isAdmin = action.payload.isAdmin ?? false
    },
    clearAuth(state) {
      state.isAuthenticated = false
      state.uid = null
      state.email = null
      state.isAdmin = false
    },
  },
})

export const { setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  isAuthenticated: boolean
  uid: string | null
  email: string | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  uid: null,
  email: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ uid: string; email: string }>) {
      state.isAuthenticated = true
      state.uid = action.payload.uid
      state.email = action.payload.email
    },
    clearAuth(state) {
      state.isAuthenticated = false
      state.uid = null
      state.email = null
    },
  },
})

export const { setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer

import { describe, it, expect } from 'vitest'
import authReducer, { setAuth, clearAuth } from './authSlice'

describe('authSlice', () => {
  it('sets auth state on setAuth', () => {
    const state = authReducer(undefined, setAuth({ token: 'tok', username: 'alice' }))
    expect(state.isAuthenticated).toBe(true)
    expect(state.token).toBe('tok')
  })

  it('clears auth state on clearAuth', () => {
    const loaded = authReducer(undefined, setAuth({ token: 'tok', username: 'alice' }))
    const state = authReducer(loaded, clearAuth())
    expect(state.isAuthenticated).toBe(false)
    expect(state.token).toBeNull()
  })
})

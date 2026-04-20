import { describe, it, expect } from 'vitest'
import authReducer, { setAuth, clearAuth } from './authSlice'

describe('authSlice', () => {
  it('sets auth state on setAuth', () => {
    const state = authReducer(undefined, setAuth({ uid: 'uid-1', email: 'alice@example.com' }))
    expect(state.isAuthenticated).toBe(true)
    expect(state.uid).toBe('uid-1')
    expect(state.email).toBe('alice@example.com')
  })

  it('clears auth state on clearAuth', () => {
    const loaded = authReducer(undefined, setAuth({ uid: 'uid-1', email: 'alice@example.com' }))
    const state = authReducer(loaded, clearAuth())
    expect(state.isAuthenticated).toBe(false)
    expect(state.uid).toBeNull()
    expect(state.email).toBeNull()
  })
})

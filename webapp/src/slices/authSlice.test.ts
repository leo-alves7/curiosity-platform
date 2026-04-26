import { describe, it, expect } from 'vitest'
import authReducer, { setAuth, clearAuth } from './authSlice'

describe('authSlice', () => {
  it('sets auth state on setAuth', () => {
    const state = authReducer(
      undefined,
      setAuth({
        uid: 'uid-1',
        email: 'alice@example.com',
        displayName: 'Alice',
        photoURL: 'https://photo.url',
      }),
    )
    expect(state.isAuthenticated).toBe(true)
    expect(state.uid).toBe('uid-1')
    expect(state.email).toBe('alice@example.com')
  })

  it('clears auth state on clearAuth', () => {
    const loaded = authReducer(
      undefined,
      setAuth({
        uid: 'uid-1',
        email: 'alice@example.com',
        displayName: 'Alice',
        photoURL: 'https://photo.url',
      }),
    )
    const state = authReducer(loaded, clearAuth())
    expect(state.isAuthenticated).toBe(false)
    expect(state.uid).toBeNull()
    expect(state.email).toBeNull()
  })

  it('stores displayName and photoURL on setAuth', () => {
    const state = authReducer(
      undefined,
      setAuth({
        uid: 'uid-1',
        email: 'alice@example.com',
        displayName: 'Alice',
        photoURL: 'https://photo.url',
      }),
    )
    expect(state.displayName).toBe('Alice')
    expect(state.photoURL).toBe('https://photo.url')
  })

  it('clears displayName and photoURL on clearAuth', () => {
    const loaded = authReducer(
      undefined,
      setAuth({
        uid: 'uid-1',
        email: 'alice@example.com',
        displayName: 'Alice',
        photoURL: 'https://photo.url',
      }),
    )
    const state = authReducer(loaded, clearAuth())
    expect(state.displayName).toBeNull()
    expect(state.photoURL).toBeNull()
  })
})

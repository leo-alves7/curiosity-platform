import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import React from 'react'
import { useAuth } from './useAuth'
import authReducer from '../slices/authSlice'

const mockUnsubscribe = vi.fn()
const mockOnAuthStateChanged = vi.fn()

vi.mock('../auth/firebase', () => ({
  auth: {},
}))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (auth: unknown, callback: (user: unknown) => void) => {
    mockOnAuthStateChanged(auth, callback)
    return mockUnsubscribe
  },
}))

vi.mock('@capacitor-firebase/authentication', () => ({
  FirebaseAuthentication: {
    signInWithGoogle: vi.fn(),
    signInWithApple: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
  },
}))

const makeWrapper = () => {
  const store = configureStore({ reducer: { auth: authReducer } })
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(Provider, { store, children })
  return { store, wrapper }
}

describe('useAuth', () => {
  beforeEach(() => {
    mockOnAuthStateChanged.mockClear()
    mockUnsubscribe.mockClear()
  })

  it('starts in loading state', () => {
    mockOnAuthStateChanged.mockImplementation(() => mockUnsubscribe)
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isLoading).toBe(true)
    expect(result.current.currentUser).toBeNull()
  })

  it('dispatches setAuth and resolves loading after sign-in', async () => {
    const mockUser = {
      uid: 'uid-1',
      email: 'alice@example.com',
      displayName: 'Alice',
      photoURL: 'https://photo.url',
      getIdToken: vi.fn().mockResolvedValue('tok'),
      getIdTokenResult: vi.fn().mockResolvedValue({ token: 'tok', claims: {} }),
    }
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: unknown) => void) => {
      cb(mockUser)
      return mockUnsubscribe
    })
    const { wrapper, store } = makeWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.currentUser).toEqual(mockUser)
    expect(store.getState().auth.isAuthenticated).toBe(true)
    expect(store.getState().auth.uid).toBe('uid-1')
    expect(store.getState().auth.email).toBe('alice@example.com')
    expect(store.getState().auth.displayName).toBe('Alice')
    expect(store.getState().auth.photoURL).toBe('https://photo.url')
  })

  it('dispatches clearAuth on sign-out', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: null) => void) => {
      cb(null)
      return mockUnsubscribe
    })
    const { wrapper, store } = makeWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(store.getState().auth.isAuthenticated).toBe(false)
  })

  it('calls FirebaseAuthentication.signInWithGoogle', async () => {
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
    mockOnAuthStateChanged.mockImplementation(() => mockUnsubscribe)
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })
    await result.current.signInWithGoogle()
    expect(FirebaseAuthentication.signInWithGoogle).toHaveBeenCalled()
  })

  it('unsubscribes on unmount', () => {
    mockOnAuthStateChanged.mockImplementation(() => mockUnsubscribe)
    const { wrapper } = makeWrapper()
    const { unmount } = renderHook(() => useAuth(), { wrapper })
    unmount()
    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('dispatches clearAuth explicitly when signOut is called', async () => {
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
    mockOnAuthStateChanged.mockImplementation(() => mockUnsubscribe)
    const { wrapper, store } = makeWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })
    await result.current.signOut()
    expect(FirebaseAuthentication.signOut).toHaveBeenCalled()
    expect(store.getState().auth.isAuthenticated).toBe(false)
  })
})

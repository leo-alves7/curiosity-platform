import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import React from 'react'
import settingsReducer from '@/slices/settingsSlice'
import { useTheme, resolveEffectiveTheme } from './useTheme'
import type { ThemePreference } from '@/slices/settingsSlice'

function makeWrapper(theme: ThemePreference) {
  const store = configureStore({
    reducer: { settings: settingsReducer },
    preloadedState: { settings: { theme, language: null as null } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(Provider, { store, children })
}

describe('resolveEffectiveTheme', () => {
  it('returns dark for dark preference', () => {
    expect(resolveEffectiveTheme('dark')).toBe('dark')
  })

  it('returns light for light preference', () => {
    expect(resolveEffectiveTheme('light')).toBe('light')
  })

  it('returns dark when system and OS is dark', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    )
    expect(resolveEffectiveTheme('system')).toBe('dark')
    vi.unstubAllGlobals()
  })

  it('returns light when system and OS is light', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    )
    expect(resolveEffectiveTheme('system')).toBe('light')
    vi.unstubAllGlobals()
  })
})

describe('useTheme', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('ion-palette-dark')
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    )
  })

  afterEach(() => {
    document.documentElement.classList.remove('ion-palette-dark')
    vi.unstubAllGlobals()
  })

  it('applies ion-palette-dark class when theme is dark', () => {
    renderHook(() => useTheme(), { wrapper: makeWrapper('dark') })
    expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(true)
  })

  it('removes ion-palette-dark class when theme is light', () => {
    document.documentElement.classList.add('ion-palette-dark')
    renderHook(() => useTheme(), { wrapper: makeWrapper('light') })
    expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(false)
  })

  it('applies dark class when theme is system and OS is dark', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    )
    renderHook(() => useTheme(), { wrapper: makeWrapper('system') })
    expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(true)
  })

  it('applies light class when theme is system and OS is light', () => {
    renderHook(() => useTheme(), { wrapper: makeWrapper('system') })
    expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(false)
  })

  it('returns the effective theme value', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: makeWrapper('dark') })
    expect(result.current).toBe('dark')
  })

  it('removes OS listener on cleanup when theme is system', () => {
    const removeListener = vi.fn()
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: removeListener,
      }),
    )
    const { unmount } = renderHook(() => useTheme(), { wrapper: makeWrapper('system') })
    unmount()
    expect(removeListener).toHaveBeenCalled()
  })
})

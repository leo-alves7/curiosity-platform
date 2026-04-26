import { describe, it, expect, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import settingsReducer, {
  setTheme,
  setLanguage,
  selectTheme,
  selectLanguage,
  type ThemePreference,
} from './settingsSlice'

function makeStore(theme?: ThemePreference) {
  return configureStore({
    reducer: { settings: settingsReducer },
    preloadedState: theme !== undefined ? { settings: { theme, language: null } } : undefined,
  })
}

describe('settingsSlice', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to system when localStorage is empty', () => {
    const store = makeStore()
    expect(selectTheme(store.getState() as Parameters<typeof selectTheme>[0])).toBe('system')
  })

  it('setTheme updates state to dark', () => {
    const store = makeStore()
    store.dispatch(setTheme('dark'))
    expect(selectTheme(store.getState() as Parameters<typeof selectTheme>[0])).toBe('dark')
  })

  it('setTheme updates state to light', () => {
    const store = makeStore()
    store.dispatch(setTheme('light'))
    expect(selectTheme(store.getState() as Parameters<typeof selectTheme>[0])).toBe('light')
  })

  it('setTheme persists to localStorage', () => {
    const store = makeStore()
    store.dispatch(setTheme('light'))
    expect(localStorage.getItem('settings.theme')).toBe('light')
  })

  it('setTheme system persists to localStorage', () => {
    const store = makeStore()
    store.dispatch(setTheme('system'))
    expect(localStorage.getItem('settings.theme')).toBe('system')
  })

  it('state shape is valid after all transitions', () => {
    const store = makeStore('system')
    store.dispatch(setTheme('dark'))
    store.dispatch(setTheme('light'))
    store.dispatch(setTheme('system'))
    const theme = selectTheme(store.getState() as Parameters<typeof selectTheme>[0])
    expect(['light', 'dark', 'system']).toContain(theme)
  })
})

describe('language field', () => {
  it('defaults to null when localStorage is empty', () => {
    const store = makeStore()
    expect(selectLanguage(store.getState() as Parameters<typeof selectLanguage>[0])).toBeNull()
  })

  it('setLanguage("en") updates state and persists to localStorage', () => {
    const store = makeStore()
    store.dispatch(setLanguage('en'))
    expect(selectLanguage(store.getState() as Parameters<typeof selectLanguage>[0])).toBe('en')
    expect(localStorage.getItem('settings.language')).toBe('en')
  })

  it('setLanguage("pt-BR") updates state and persists to localStorage', () => {
    const store = makeStore()
    store.dispatch(setLanguage('pt-BR'))
    expect(selectLanguage(store.getState() as Parameters<typeof selectLanguage>[0])).toBe('pt-BR')
    expect(localStorage.getItem('settings.language')).toBe('pt-BR')
  })

  it('setLanguage(null) updates state and removes key from localStorage', () => {
    const store = makeStore()
    store.dispatch(setLanguage('en'))
    store.dispatch(setLanguage(null))
    expect(selectLanguage(store.getState() as Parameters<typeof selectLanguage>[0])).toBeNull()
    expect(localStorage.getItem('settings.language')).toBeNull()
  })
})

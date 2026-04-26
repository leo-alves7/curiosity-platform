import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

export type ThemePreference = 'light' | 'dark' | 'system'
export type LanguagePreference = 'en' | 'pt-BR' | null

const SETTINGS_THEME_KEY = 'settings.theme'
const SETTINGS_LANGUAGE_KEY = 'settings.language'

function loadTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(SETTINGS_THEME_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
    return 'system'
  } catch {
    return 'system'
  }
}

function loadLanguage(): LanguagePreference {
  try {
    const stored = localStorage.getItem(SETTINGS_LANGUAGE_KEY)
    if (stored === 'en' || stored === 'pt-BR') return stored
    return null
  } catch {
    return null
  }
}

interface SettingsState {
  theme: ThemePreference
  language: LanguagePreference
}

const initialState: SettingsState = {
  theme: loadTheme(),
  language: loadLanguage(),
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemePreference>) {
      state.theme = action.payload
      try {
        localStorage.setItem(SETTINGS_THEME_KEY, action.payload)
      } catch {
        // ignore storage errors
      }
    },
    setLanguage(state, action: PayloadAction<LanguagePreference>) {
      state.language = action.payload
      try {
        if (action.payload === null) {
          localStorage.removeItem(SETTINGS_LANGUAGE_KEY)
        } else {
          localStorage.setItem(SETTINGS_LANGUAGE_KEY, action.payload)
        }
      } catch {
        // ignore storage errors
      }
    },
  },
})

export const { setTheme, setLanguage } = settingsSlice.actions
export const selectTheme = (state: RootState) => state.settings.theme
export const selectLanguage = (state: RootState) => state.settings.language
export default settingsSlice.reducer

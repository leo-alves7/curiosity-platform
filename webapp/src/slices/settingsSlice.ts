import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

export type ThemePreference = 'light' | 'dark' | 'system'

const SETTINGS_THEME_KEY = 'settings.theme'

function loadTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(SETTINGS_THEME_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
    return 'system'
  } catch {
    return 'system'
  }
}

interface SettingsState {
  theme: ThemePreference
}

const initialState: SettingsState = {
  theme: loadTheme(),
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
  },
})

export const { setTheme } = settingsSlice.actions
export const selectTheme = (state: RootState) => state.settings.theme
export default settingsSlice.reducer

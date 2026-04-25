import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

const UI_PANEL_KEY = 'ui.isPanelOpen'

interface UiState {
  isPanelOpen: boolean
}

function loadPanelState(): boolean {
  try {
    const stored = localStorage.getItem(UI_PANEL_KEY)
    if (stored === null) return true
    return stored === 'true'
  } catch {
    return true
  }
}

const initialState: UiState = {
  isPanelOpen: loadPanelState(),
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    togglePanel(state) {
      state.isPanelOpen = !state.isPanelOpen
      try {
        localStorage.setItem(UI_PANEL_KEY, String(state.isPanelOpen))
      } catch {
        // ignore storage errors
      }
    },
    setPanelOpen(state, action: PayloadAction<boolean>) {
      state.isPanelOpen = action.payload
      try {
        localStorage.setItem(UI_PANEL_KEY, String(state.isPanelOpen))
      } catch {
        // ignore storage errors
      }
    },
  },
})

export const { togglePanel, setPanelOpen } = uiSlice.actions

export const selectIsPanelOpen = (state: RootState) => state.ui.isPanelOpen

export default uiSlice.reducer

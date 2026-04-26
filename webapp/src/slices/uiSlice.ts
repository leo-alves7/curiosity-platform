import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

const UI_PANEL_KEY = 'ui.isPanelOpen'

export interface PinLocation {
  lat: number
  lng: number
}

interface UiState {
  isPanelOpen: boolean
  isAddingStore: boolean
  pinLocation: PinLocation | null
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
  isAddingStore: false,
  pinLocation: null,
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
    setIsAddingStore(state, action: PayloadAction<boolean>) {
      state.isAddingStore = action.payload
      if (!action.payload) {
        state.pinLocation = null
      }
    },
    setPinLocation(state, action: PayloadAction<PinLocation | null>) {
      state.pinLocation = action.payload
    },
    resetAddStore(state) {
      state.isAddingStore = false
      state.pinLocation = null
    },
  },
})

export const { togglePanel, setPanelOpen, setIsAddingStore, setPinLocation, resetAddStore } =
  uiSlice.actions

export const selectIsPanelOpen = (state: RootState) => state.ui.isPanelOpen
export const selectIsAddingStore = (state: RootState) => state.ui.isAddingStore
export const selectPinLocation = (state: RootState) => state.ui.pinLocation

export default uiSlice.reducer

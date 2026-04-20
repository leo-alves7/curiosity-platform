import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface MapState {
  center: [number, number]
  zoom: number
}

const initialState: MapState = {
  center: [-53.45528, -24.95583],
  zoom: 12,
}

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setCenter(state, action: PayloadAction<[number, number]>) {
      state.center = action.payload
    },
    setZoom(state, action: PayloadAction<number>) {
      state.zoom = action.payload
    },
  },
})

export const { setCenter, setZoom } = mapSlice.actions
export const selectMapCenter = (state: { map: MapState }) => state.map.center
export const selectMapZoom = (state: { map: MapState }) => state.map.zoom

export default mapSlice.reducer

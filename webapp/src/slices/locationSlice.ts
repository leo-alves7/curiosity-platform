import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

interface UserLocation {
  lat: number
  lng: number
  accuracy: number
}

interface LocationState {
  userLocation: UserLocation | null
  isFollowingUser: boolean
}

const initialState: LocationState = {
  userLocation: null,
  isFollowingUser: false,
}

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setUserLocation(state, action: PayloadAction<UserLocation>) {
      state.userLocation = action.payload
    },
    setFollowingUser(state, action: PayloadAction<boolean>) {
      state.isFollowingUser = action.payload
    },
  },
})

export const { setUserLocation, setFollowingUser } = locationSlice.actions
export const selectUserLocation = (state: RootState) => state.location.userLocation
export const selectFollowingUser = (state: RootState) => state.location.isFollowingUser

export default locationSlice.reducer

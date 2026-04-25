import { describe, it, expect } from 'vitest'
import locationReducer, { setUserLocation, setFollowingUser } from './locationSlice'

const initialState = {
  userLocation: null,
  isFollowingUser: false,
}

describe('locationSlice', () => {
  it('returns initial state', () => {
    expect(locationReducer(undefined, { type: '@@INIT' })).toEqual(initialState)
  })

  it('setUserLocation updates userLocation', () => {
    const location = { lat: -23.5505, lng: -46.6333, accuracy: 10 }
    const state = locationReducer(initialState, setUserLocation(location))
    expect(state.userLocation).toEqual(location)
  })

  it('setFollowingUser updates isFollowingUser', () => {
    const state = locationReducer(initialState, setFollowingUser(true))
    expect(state.isFollowingUser).toBe(true)
  })
})

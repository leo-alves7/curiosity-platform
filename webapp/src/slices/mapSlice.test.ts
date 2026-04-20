import { describe, it, expect } from 'vitest'
import mapReducer, { setCenter, setZoom } from './mapSlice'

const initialState = {
  center: [-53.45528, -24.95583] as [number, number],
  zoom: 12,
}

describe('mapSlice', () => {
  it('returns initial state', () => {
    expect(mapReducer(undefined, { type: '@@INIT' })).toEqual(initialState)
  })

  it('setCenter updates center', () => {
    const state = mapReducer(initialState, setCenter([-46.6333, -23.5505]))
    expect(state.center).toEqual([-46.6333, -23.5505])
  })

  it('setZoom updates zoom', () => {
    const state = mapReducer(initialState, setZoom(15))
    expect(state.zoom).toBe(15)
  })
})

import { describe, it, expect } from 'vitest'
import { storesToFeatureCollection } from './storeGeoJSONConverter'
import type { StoreResponse } from '@/types/store'

function makeStore(overrides: Partial<StoreResponse> = {}): StoreResponse {
  return {
    id: 'store-1',
    name: 'Test Store',
    description: 'A description',
    address: '123 Main St',
    lat: -24.95,
    lng: -53.45,
    category_id: 'cat-1',
    image_url: 'https://example.com/img.jpg',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('storesToFeatureCollection', () => {
  it('returns a FeatureCollection with correct type', () => {
    const result = storesToFeatureCollection([makeStore()])
    expect(result.type).toBe('FeatureCollection')
  })

  it('converts a store to a GeoJSON Feature', () => {
    const store = makeStore()
    const result = storesToFeatureCollection([store])
    expect(result.features).toHaveLength(1)
    expect(result.features[0].type).toBe('Feature')
    expect(result.features[0].geometry.type).toBe('Point')
  })

  it('uses [lng, lat] coordinate order', () => {
    const store = makeStore({ lat: -24.95, lng: -53.45 })
    const result = storesToFeatureCollection([store])
    const coords = (result.features[0].geometry as GeoJSON.Point).coordinates
    expect(coords[0]).toBe(-53.45)
    expect(coords[1]).toBe(-24.95)
  })

  it('preserves all expected properties', () => {
    const store = makeStore()
    const result = storesToFeatureCollection([store])
    const props = result.features[0].properties!
    expect(props.id).toBe(store.id)
    expect(props.name).toBe(store.name)
    expect(props.category_id).toBe(store.category_id)
    expect(props.image_url).toBe(store.image_url)
    expect(props.lat).toBe(store.lat)
    expect(props.lng).toBe(store.lng)
    expect(props.address).toBe(store.address)
    expect(props.description).toBe(store.description)
  })

  it('filters out stores with null lat', () => {
    const stores = [makeStore({ id: 'a', lat: null }), makeStore({ id: 'b' })]
    const result = storesToFeatureCollection(stores)
    expect(result.features).toHaveLength(1)
    expect(result.features[0].properties!.id).toBe('b')
  })

  it('filters out stores with null lng', () => {
    const stores = [makeStore({ id: 'a', lng: null }), makeStore({ id: 'b' })]
    const result = storesToFeatureCollection(stores)
    expect(result.features).toHaveLength(1)
    expect(result.features[0].properties!.id).toBe('b')
  })

  it('returns empty features array for empty input', () => {
    const result = storesToFeatureCollection([])
    expect(result.features).toHaveLength(0)
  })

  it('handles multiple stores correctly', () => {
    const stores = [makeStore({ id: 'a' }), makeStore({ id: 'b' }), makeStore({ id: 'c' })]
    const result = storesToFeatureCollection(stores)
    expect(result.features).toHaveLength(3)
  })

  it('sets category_slug from slugMap when category_id is present', () => {
    const slugMap = { 'cat-1': 'restaurant' }
    const result = storesToFeatureCollection([makeStore()], slugMap)
    expect(result.features[0].properties?.category_slug).toBe('restaurant')
  })

  it('defaults category_slug to "default" when category_id not in slugMap', () => {
    const result = storesToFeatureCollection([makeStore()], {})
    expect(result.features[0].properties?.category_slug).toBe('default')
  })

  it('defaults category_slug to "default" when category_id is null', () => {
    const result = storesToFeatureCollection([makeStore({ category_id: null })])
    expect(result.features[0].properties?.category_slug).toBe('default')
  })
})

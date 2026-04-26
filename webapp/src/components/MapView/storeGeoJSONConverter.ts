import type { StoreResponse } from '@/types/store'

export function storesToFeatureCollection(stores: StoreResponse[]): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = stores
    .filter((s) => s.lat != null && s.lng != null)
    .map((s) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [s.lng as number, s.lat as number],
      },
      properties: {
        id: s.id,
        name: s.name,
        category_id: s.category_id,
        image_url: s.image_url,
        lat: s.lat,
        lng: s.lng,
        address: s.address,
        description: s.description,
      },
    }))

  return { type: 'FeatureCollection', features }
}

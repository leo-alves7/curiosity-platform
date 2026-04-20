import { useEffect, useRef } from 'react'
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import maplibregl from 'maplibre-gl'
import StorePopup from '@/components/StorePopup'
import type { StoreResponse } from '@/types/store'

type MarkerEntry = { marker: maplibregl.Marker; root: ReturnType<typeof createRoot> }

export function useMapMarkers(
  map: maplibregl.Map | null,
  stores: StoreResponse[],
  categoryMap: Record<string, string>,
  onViewDetails: (storeId: string) => void,
) {
  const markersRef = useRef<Map<string, MarkerEntry>>(new Map())

  useEffect(() => {
    if (!map) return

    const current = markersRef.current

    const storeIds = new Set(stores.map((s) => s.id))
    for (const [id, entry] of current) {
      if (!storeIds.has(id)) {
        entry.marker.remove()
        entry.root.unmount()
        current.delete(id)
      }
    }

    for (const store of stores) {
      if (store.lat == null || store.lng == null) continue
      if (current.has(store.id)) continue

      const el = document.createElement('div')
      const root = createRoot(el)
      root.render(
        createElement(StorePopup, {
          store,
          categoryName: categoryMap[store.category_id ?? ''],
          onViewDetails,
        }),
      )

      const popup = new maplibregl.Popup({ offset: 25 }).setDOMContent(el)
      const marker = new maplibregl.Marker()
        .setLngLat([store.lng, store.lat])
        .setPopup(popup)
        .addTo(map)

      current.set(store.id, { marker, root })
    }

    return () => {
      for (const entry of current.values()) {
        entry.marker.remove()
        entry.root.unmount()
      }
      current.clear()
    }
  }, [map, stores, categoryMap, onViewDetails])
}

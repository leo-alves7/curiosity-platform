import { useEffect } from 'react'
import maplibregl from 'maplibre-gl'
import type { StoreResponse } from '@/types/store'
import { STORES_SOURCE_ID, CLUSTERS_LAYER_ID, UNCLUSTERED_LAYER_ID } from './storeClusterLayers'
import { createStorePopup } from './createStorePopup'

export function useStoreClusterHandlers(
  map: maplibregl.Map | null,
  stores: StoreResponse[],
  categoryMap: Record<string, string>,
  onMarkerClick: (storeId: string) => void,
): void {
  useEffect(() => {
    if (!map) return

    const handleClusterClick = (
      e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] },
    ) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [CLUSTERS_LAYER_ID] })
      if (!features.length) return
      const feature = features[0]
      const source = map.getSource(STORES_SOURCE_ID) as maplibregl.GeoJSONSource
      const clusterId = feature.properties?.cluster_id as number
      source
        .getClusterExpansionZoom(clusterId)
        .then((zoom) => {
          const geometry = feature.geometry as GeoJSON.Point
          map.easeTo({ center: geometry.coordinates as [number, number], zoom })
        })
        .catch(() => {})
    }

    const handleUnclusteredClick = (
      e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] },
    ) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [UNCLUSTERED_LAYER_ID] })
      if (!features.length) return
      const feature = features[0]
      const storeId = feature.properties?.id as string | undefined
      if (!storeId) return

      const store = stores.find((s) => s.id === storeId)
      if (!store || store.lat == null || store.lng == null) return

      const popup = createStorePopup(store, categoryMap, onMarkerClick)
      popup.setLngLat([store.lng, store.lat]).addTo(map)
    }

    map.on('click', CLUSTERS_LAYER_ID, handleClusterClick)
    map.on('click', UNCLUSTERED_LAYER_ID, handleUnclusteredClick)

    const setCursorPointer = () => {
      map.getCanvas().style.cursor = 'pointer'
    }
    const resetCursor = () => {
      map.getCanvas().style.cursor = ''
    }

    map.on('mouseenter', CLUSTERS_LAYER_ID, setCursorPointer)
    map.on('mouseleave', CLUSTERS_LAYER_ID, resetCursor)
    map.on('mouseenter', UNCLUSTERED_LAYER_ID, setCursorPointer)
    map.on('mouseleave', UNCLUSTERED_LAYER_ID, resetCursor)

    return () => {
      map.off('click', CLUSTERS_LAYER_ID, handleClusterClick)
      map.off('click', UNCLUSTERED_LAYER_ID, handleUnclusteredClick)
      map.off('mouseenter', CLUSTERS_LAYER_ID, setCursorPointer)
      map.off('mouseleave', CLUSTERS_LAYER_ID, resetCursor)
      map.off('mouseenter', UNCLUSTERED_LAYER_ID, setCursorPointer)
      map.off('mouseleave', UNCLUSTERED_LAYER_ID, resetCursor)
    }
  }, [map, stores, categoryMap, onMarkerClick])
}

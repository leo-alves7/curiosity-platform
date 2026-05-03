import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import type { StoreResponse } from '@/types/store'
import { storesToFeatureCollection } from './storeGeoJSONConverter'
import {
  STORES_SOURCE_ID,
  CLUSTERS_LAYER_ID,
  CLUSTER_COUNT_LAYER_ID,
  UNCLUSTERED_LAYER_ID,
  getClusterLayerDefs,
} from './storeClusterLayers'

export interface MarkerActions {
  panToMarker: (storeId: string) => void
  openMarkerPopup: (storeId: string) => void
}

export function useMapMarkers(
  map: maplibregl.Map | null,
  stores: StoreResponse[],
  _categoryMap: Record<string, string>,
  _onViewDetails: (storeId: string) => void,
): MarkerActions {
  const mapRef = useRef<maplibregl.Map | null>(null)
  const storesRef = useRef<StoreResponse[]>(stores)
  const actionsRef = useRef<MarkerActions>({
    panToMarker: () => {},
    openMarkerPopup: () => {},
  })

  mapRef.current = map
  storesRef.current = stores

  useEffect(() => {
    if (!map) return

    const addLayers = () => {
      if (map.getSource(STORES_SOURCE_ID)) return

      const featureCollection = storesToFeatureCollection(stores)
      map.addSource(STORES_SOURCE_ID, {
        type: 'geojson',
        data: featureCollection,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      })

      for (const layerDef of getClusterLayerDefs()) {
        map.addLayer(layerDef)
      }
    }

    if (map.isStyleLoaded()) {
      addLayers()
    } else {
      map.once('load', addLayers)
    }

    return () => {
      try {
        map.off('load', addLayers)
        if (map.getLayer(UNCLUSTERED_LAYER_ID)) map.removeLayer(UNCLUSTERED_LAYER_ID)
        if (map.getLayer(CLUSTER_COUNT_LAYER_ID)) map.removeLayer(CLUSTER_COUNT_LAYER_ID)
        if (map.getLayer(CLUSTERS_LAYER_ID)) map.removeLayer(CLUSTERS_LAYER_ID)
        if (map.getSource(STORES_SOURCE_ID)) map.removeSource(STORES_SOURCE_ID)
      } catch {
        // map.remove() already ran; nothing to clean up.
      }
    }
  }, [map])

  useEffect(() => {
    if (!map) return
    const source = map.getSource(STORES_SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    if (!source) return
    source.setData(storesToFeatureCollection(stores))
  }, [map, stores])

  actionsRef.current = {
    panToMarker: (storeId: string) => {
      const activeMap = mapRef.current
      if (!activeMap) return
      const store = storesRef.current.find((s) => s.id === storeId)
      if (!store || store.lat == null || store.lng == null) return
      activeMap.flyTo({ center: [store.lng, store.lat], zoom: Math.max(activeMap.getZoom(), 14) })
    },
    openMarkerPopup: (_storeId: string) => {
      // Popups are handled by useStoreClusterHandlers via map layer click events.
    },
  }

  return actionsRef.current
}

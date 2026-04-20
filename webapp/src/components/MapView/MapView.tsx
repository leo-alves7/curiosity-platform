import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IonSpinner, IonText } from '@ionic/react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMapMarkers, type MarkerActions } from './useMapMarkers'
import {
  fetchStoresAndCategories,
  selectStores,
  selectCategoryMap,
  selectStoresStatus,
  selectStoresError,
} from '@/slices/storesSlice'
import { setCenter, setZoom, selectMapCenter, selectMapZoom } from '@/slices/mapSlice'
import type { AppDispatch } from '@/store'

const MAP_STYLE =
  import.meta.env.VITE_MAPLIBRE_STYLE_URL ?? 'https://demotiles.maplibre.org/style.json'

interface MapViewProps {
  onMarkerActionsReady?: (actions: MarkerActions) => void
  onViewDetails?: (storeId: string) => void
}

function MapView({ onMarkerActionsReady, onViewDetails }: MapViewProps = {}) {
  const dispatch = useDispatch<AppDispatch>()
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const [map, setMap] = useState<maplibregl.Map | null>(null)

  const center = useSelector(selectMapCenter)
  const zoom = useSelector(selectMapZoom)
  const stores = useSelector(selectStores)
  const categoryMap = useSelector(selectCategoryMap)
  const status = useSelector(selectStoresStatus)
  const error = useSelector(selectStoresError)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchStoresAndCategories())
    }
  }, [status, dispatch])

  useEffect(() => {
    if (!mapContainer.current) return

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center,
      zoom,
    })

    mapInstance.on('moveend', () => {
      const c = mapInstance.getCenter()
      dispatch(setCenter([c.lng, c.lat]))
    })

    mapInstance.on('zoomend', () => {
      dispatch(setZoom(mapInstance.getZoom()))
    })

    setMap(mapInstance)

    return () => {
      setMap(null)
      mapInstance.remove()
    }
  }, [])

  const handleViewDetails = useCallback(
    (storeId: string) => {
      onViewDetails?.(storeId)
    },
    [onViewDetails],
  )

  const markerActions = useMapMarkers(map, stores, categoryMap, handleViewDetails)

  useEffect(() => {
    if (onMarkerActionsReady) {
      onMarkerActionsReady(markerActions)
    }
  }, [onMarkerActionsReady, markerActions])

  if (status === 'failed') {
    return (
      <IonText color="danger">
        <p>Failed to load stores: {error}</p>
      </IonText>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {status === 'loading' && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <IonSpinner />
        </div>
      )}
    </div>
  )
}

export default MapView

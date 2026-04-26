import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IonSpinner, IonText, IonToast } from '@ionic/react'
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
import { setFollowingUser, selectUserLocation, selectFollowingUser } from '@/slices/locationSlice'
import { selectIsAddingStore } from '@/slices/uiSlice'
import { useUserLocation } from '@/hooks/useUserLocation'
import UserLocationLayer from './UserLocationLayer'
import LocateMeFab from './LocateMeFab'
import type { AppDispatch } from '@/store'

const OPENFREEMAP_LIBERTY = 'https://tiles.openfreemap.org/styles/liberty'

function resolveMapStyle(prefersDark: boolean): string {
  if (prefersDark) {
    return (
      import.meta.env.VITE_MAPLIBRE_STYLE_URL_DARK ??
      import.meta.env.VITE_MAPLIBRE_STYLE_URL ??
      OPENFREEMAP_LIBERTY
    )
  }
  return (
    import.meta.env.VITE_MAPLIBRE_STYLE_URL_LIGHT ??
    import.meta.env.VITE_MAPLIBRE_STYLE_URL ??
    OPENFREEMAP_LIBERTY
  )
}

interface MapViewProps {
  onMarkerActionsReady?: (actions: MarkerActions) => void
  onMapReady?: (map: maplibregl.Map | null) => void
  onViewDetails?: (storeId: string) => void
  bottomOffset?: number
  showLocateFab?: boolean
}

function MapView({
  onMarkerActionsReady,
  onMapReady,
  onViewDetails,
  bottomOffset = 0,
  showLocateFab = true,
}: MapViewProps = {}) {
  const dispatch = useDispatch<AppDispatch>()
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const [map, setMap] = useState<maplibregl.Map | null>(null)
  const [showPermissionToast, setShowPermissionToast] = useState(false)

  const center = useSelector(selectMapCenter)
  const zoom = useSelector(selectMapZoom)
  const stores = useSelector(selectStores)
  const categoryMap = useSelector(selectCategoryMap)
  const status = useSelector(selectStoresStatus)
  const error = useSelector(selectStoresError)
  const userLocation = useSelector(selectUserLocation)
  const isFollowingUser = useSelector(selectFollowingUser)
  const isAddingStore = useSelector(selectIsAddingStore)
  const isAddingStoreRef = useRef(false)
  isAddingStoreRef.current = isAddingStore

  useUserLocation()

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchStoresAndCategories())
    }
  }, [status, dispatch])

  useEffect(() => {
    if (!mapContainer.current) return

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: resolveMapStyle(prefersDark),
      center,
      zoom,
      pitch: 45,
      bearing: 0,
      attributionControl: false,
    })
    mapInstance.addControl(new maplibregl.AttributionControl(), 'bottom-left')

    mapInstance.dragPan.disable()
    mapInstance.dragRotate.disable()

    let activeButton: number | null = null
    let lastX = 0
    let lastY = 0
    let hasDragged = false
    const DRAG_THRESHOLD = 4

    const onPointerDown = (e: PointerEvent) => {
      activeButton = e.button
      lastX = e.clientX
      lastY = e.clientY
      hasDragged = false
      // Any user-initiated pan (right-drag) cancels follow mode. dragPan is disabled
      // so MapLibre's 'dragstart' event never fires — we handle it here instead.
      if (e.button === 2) {
        dispatch(setFollowingUser(false))
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      if (activeButton === null || !e.buttons) return

      const isLocked = document.pointerLockElement === container
      const dx = isLocked ? e.movementX : e.clientX - lastX
      const dy = isLocked ? e.movementY : e.clientY - lastY
      if (!isLocked) {
        lastX = e.clientX
        lastY = e.clientY
      }

      // Require intentional drag before rotating or locking — prevents accidental
      // rotation when clicking store markers or dropping a pin.
      if (!hasDragged) {
        if (Math.abs(dx) + Math.abs(dy) <= DRAG_THRESHOLD) return
        hasDragged = true
        if (activeButton === 0 && !isAddingStoreRef.current) {
          container.requestPointerLock?.()
        }
      }

      if (activeButton === 0 && !isAddingStoreRef.current) {
        mapInstance.setBearing(mapInstance.getBearing() + dx * 0.3)
      } else if (activeButton === 1) {
        const newPitch = Math.max(0, Math.min(85, mapInstance.getPitch() - dy * 0.3))
        mapInstance.setPitch(newPitch)
      } else if (activeButton === 2) {
        mapInstance.panBy([-dx, -dy], { animate: false })
      }
    }

    const releaseLock = () => {
      if (document.pointerLockElement === container) {
        document.exitPointerLock?.()
      }
      activeButton = null
    }

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    const container = mapContainer.current
    container.addEventListener('pointerdown', onPointerDown)
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerup', releaseLock)
    container.addEventListener('pointercancel', releaseLock)
    container.addEventListener('contextmenu', onContextMenu)

    mapInstance.on('moveend', () => {
      const c = mapInstance.getCenter()
      dispatch(setCenter([c.lng, c.lat]))
    })

    mapInstance.on('zoomend', () => {
      dispatch(setZoom(mapInstance.getZoom()))
    })

    setMap(mapInstance)

    return () => {
      container.removeEventListener('pointerdown', onPointerDown)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerup', releaseLock)
      container.removeEventListener('pointercancel', releaseLock)
      if (document.pointerLockElement === container) {
        document.exitPointerLock?.()
      }
      container.removeEventListener('contextmenu', onContextMenu)
      mapInstance.remove()
    }
  }, [])

  const handleViewDetails = useCallback(
    (storeId: string) => {
      onViewDetails?.(storeId)
    },
    [onViewDetails],
  )

  useEffect(() => {
    if (!isFollowingUser || !map || !userLocation) return
    map.easeTo({ center: [userLocation.lng, userLocation.lat], duration: 500 })
  }, [isFollowingUser, map, userLocation])

  const handleToggleFollow = useCallback(
    (active: boolean) => {
      dispatch(setFollowingUser(active))
    },
    [dispatch],
  )

  const markerActions = useMapMarkers(map, stores, categoryMap, handleViewDetails)

  useEffect(() => {
    if (onMarkerActionsReady) {
      onMarkerActionsReady(markerActions)
    }
  }, [onMarkerActionsReady, markerActions])

  useEffect(() => {
    if (onMapReady) {
      onMapReady(map)
    }
  }, [onMapReady, map])

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
      <UserLocationLayer map={map} userLocation={userLocation} />
      {showLocateFab && (
        <LocateMeFab
          userLocation={userLocation}
          isFollowingUser={isFollowingUser}
          onToggleFollow={handleToggleFollow}
          bottomOffset={bottomOffset}
        />
      )}
      <IonToast
        isOpen={showPermissionToast}
        message="Location permission denied. Enable it in your browser settings."
        duration={4000}
        onDidDismiss={() => setShowPermissionToast(false)}
      />
    </div>
  )
}

export default MapView

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'

export function usePinDrop(
  map: maplibregl.Map | null,
  isActive: boolean,
  onPinDropped: (lat: number, lng: number) => void,
): void {
  const markerRef = useRef<maplibregl.Marker | null>(null)
  const callbackRef = useRef(onPinDropped)
  callbackRef.current = onPinDropped

  useEffect(() => {
    if (!map || !isActive) return

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat

      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat])
      } else {
        const marker = new maplibregl.Marker({ color: 'var(--ion-color-primary)', draggable: true })
          .setLngLat([lng, lat])
          .addTo(map)

        marker.on('dragend', () => {
          const position = marker.getLngLat()
          callbackRef.current(position.lat, position.lng)
        })

        markerRef.current = marker
      }

      callbackRef.current(lat, lng)
    }

    map.on('click', handleClick)
    const canvas = typeof map.getCanvas === 'function' ? map.getCanvas() : null
    const previousCursor = canvas?.style.cursor ?? ''
    if (canvas) {
      canvas.style.cursor = 'crosshair'
    }

    return () => {
      map.off('click', handleClick)
      if (canvas) {
        canvas.style.cursor = previousCursor
      }
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
    }
  }, [map, isActive])
}

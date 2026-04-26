import { useEffect } from 'react'
import maplibregl from 'maplibre-gl'

interface UserLocation {
  lat: number
  lng: number
  accuracy: number
}

interface UserLocationLayerProps {
  map: maplibregl.Map | null
  userLocation: UserLocation | null
}

const SOURCE_ID = 'user-location'
const ACCURACY_LAYER_ID = 'user-location-accuracy'
const DOT_LAYER_ID = 'user-location-dot'

function UserLocationLayer({ map, userLocation }: UserLocationLayerProps) {
  // Set up source and layers once the map style is fully loaded; clean up on unmount.
  // addSource/addLayer throw if called before the style finishes loading, so we must
  // wait for the 'load' event when the style is still in progress.
  useEffect(() => {
    if (!map) return

    const addLayers = () => {
      if (map.getSource(SOURCE_ID)) return

      const emptyGeojson: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }
      map.addSource(SOURCE_ID, { type: 'geojson', data: emptyGeojson })

      map.addLayer({
        id: ACCURACY_LAYER_ID,
        type: 'circle',
        source: SOURCE_ID,
        paint: {
          'circle-color': 'rgba(0, 0, 255, 0.1)',
          'circle-stroke-color': 'rgba(0, 0, 255, 0.3)',
          'circle-stroke-width': 1,
          // Radius interpolates with zoom so the circle matches real-world meters
          'circle-radius': ['interpolate', ['exponential', 2], ['zoom'], 0, 0, 20, 150],
          'circle-pitch-alignment': 'map',
        },
      })

      map.addLayer({
        id: DOT_LAYER_ID,
        type: 'circle',
        source: SOURCE_ID,
        paint: {
          'circle-color': 'rgba(0, 100, 255, 1)',
          'circle-radius': 8,
          'circle-stroke-color': 'white',
          'circle-stroke-width': 2,
          'circle-pitch-alignment': 'viewport',
        },
      })
    }

    if (map.isStyleLoaded()) {
      addLayers()
    } else {
      map.once('load', addLayers)
    }

    return () => {
      try {
        map.off('load', addLayers)
        if (map.getLayer(DOT_LAYER_ID)) map.removeLayer(DOT_LAYER_ID)
        if (map.getLayer(ACCURACY_LAYER_ID)) map.removeLayer(ACCURACY_LAYER_ID)
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID)
      } catch {
        // map.remove() already ran; internal style state is gone, nothing to clean up.
      }
    }
  }, [map])

  // Update source data whenever the position changes — no layer teardown needed.
  useEffect(() => {
    if (!map || !userLocation) return
    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    if (!source) return

    const { lat, lng, accuracy } = userLocation
    source.setData({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [lng, lat] },
          properties: { accuracy },
        },
      ],
    })
  }, [map, userLocation])

  return null
}

export default UserLocationLayer

import { useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

function MapPage() {
  const mapContainer = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [-53.45528, -24.95583],
      zoom: 12,
    })
    return () => map.remove()
  }, [])

  return <Box ref={mapContainer} sx={{ width: '100%', height: '100vh' }} />
}

export default MapPage

import { useEffect, useRef } from 'react'
import { IonContent, IonPage } from '@ionic/react'
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

  return (
    <IonPage>
      <IonContent>
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      </IonContent>
    </IonPage>
  )
}

export default MapPage

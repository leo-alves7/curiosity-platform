import { IonContent, IonPage } from '@ionic/react'
import MapView from '@/components/MapView'

function MapPage() {
  return (
    <IonPage>
      <IonContent>
        <MapView />
      </IonContent>
    </IonPage>
  )
}

export default MapPage

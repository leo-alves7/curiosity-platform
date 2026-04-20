import { setupIonicReact, IonApp } from '@ionic/react'
import '@ionic/core/css/core.css'
import MapPage from './pages/MapPage'

setupIonicReact()

function App() {
  return (
    <IonApp>
      <MapPage />
    </IonApp>
  )
}

export default App

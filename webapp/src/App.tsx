import { setupIonicReact, IonApp, IonRouterOutlet, IonSpinner } from '@ionic/react'
import '@ionic/core/css/core.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import MapPage from './pages/MapPage'
import { useAuth } from './auth/useAuth'

setupIonicReact()

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <IonApp>
        <IonSpinner />
      </IonApp>
    )
  }

  return (
    <IonApp>
      <BrowserRouter>
        <IonRouterOutlet>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MapPage />} />
            </Route>
          </Routes>
        </IonRouterOutlet>
      </BrowserRouter>
    </IonApp>
  )
}

export default App

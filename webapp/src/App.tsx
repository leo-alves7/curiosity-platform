import { setupIonicReact, IonApp, IonRouterOutlet, IonSpinner } from '@ionic/react'
import '@ionic/core/css/core.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import AdminRoute from './auth/AdminRoute'
import LoginPage from './pages/LoginPage'
import MapPage from './pages/MapPage'
import ExplorePage from './pages/ExplorePage'
import StoreDetailPage from './pages/StoreDetailPage'
import AdminPage from './pages/AdminPage'
import AppTabs from './components/AppTabs/AppTabs'
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
              <Route element={<AppTabs />}>
                <Route path="/" element={<Navigate to="/map" replace />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/stores/:id" element={<StoreDetailPage />} />
              </Route>
            </Route>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Routes>
        </IonRouterOutlet>
      </BrowserRouter>
    </IonApp>
  )
}

export default App

import { setupIonicReact, IonApp, IonSpinner, IonToast } from '@ionic/react'
import '@ionic/core/css/core.css'
import '@ionic/core/css/palettes/dark.class.css'
import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import ProtectedRoute from './auth/ProtectedRoute'
import AdminRoute from './auth/AdminRoute'
import LoginPage from './pages/LoginPage'
import MapPage from './pages/MapPage'
import ExplorePage from './pages/ExplorePage'
import StoreDetailPage from './pages/StoreDetailPage'
import AdminPage from './pages/AdminPage'
import AppTabs from './components/AppTabs/AppTabs'
import { useAuth } from './auth/useAuth'
import { useTheme } from './hooks/useTheme'
import { useAnalytics } from './hooks/useAnalytics'
import { selectLanguage } from './slices/settingsSlice'
import i18n from './i18n/index'
import { detectLanguage } from './i18n/detectLanguage'
import type { RootState } from './store'

setupIonicReact()

function App() {
  useTheme()
  const { isLoading } = useAuth()
  const { t } = useTranslation()
  const language = useSelector(selectLanguage)
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const { trackAppOpen } = useAnalytics()
  const [showAutoSwitchToast, setShowAutoSwitchToast] = useState(false)

  useEffect(() => {
    if (language !== null) {
      i18n.changeLanguage(language)
      return
    }
    const detected = detectLanguage()
    if (detected === 'pt-BR') {
      i18n.changeLanguage('pt-BR')
      setShowAutoSwitchToast(true)
    } else {
      i18n.changeLanguage('en')
    }
  }, [language])

  useEffect(() => {
    if (isAuthenticated) {
      trackAppOpen()
    }
  }, [isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

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
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/map" replace />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/stores/:id" element={<StoreDetailPage />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Routes>
        <AppTabs />
      </BrowserRouter>
      <IonToast
        isOpen={showAutoSwitchToast}
        message={t('i18n.autoSwitchedToast')}
        duration={5000}
        buttons={[{ text: 'OK', role: 'cancel' }]}
        onDidDismiss={() => setShowAutoSwitchToast(false)}
      />
    </IonApp>
  )
}

export default App

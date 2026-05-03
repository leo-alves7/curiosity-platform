import { IonLabel, IonTabBar, IonTabButton } from '@ionic/react'
import { Map, Search } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useIsMobile } from './useIsMobile'

const TAB_BAR_HEIGHT = 56
const TAB_ROUTES = ['/', '/map', '/explore']

function AppTabs() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  const isTabRoute = TAB_ROUTES.includes(location.pathname)
  if (!isMobile || !isTabRoute) return null

  const activeTab = location.pathname.startsWith('/explore') ? 'explore' : 'map'

  return (
    <IonTabBar
      style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        height: `${TAB_BAR_HEIGHT}px`,
        zIndex: '10',
      }}
    >
      <IonTabButton tab="map" selected={activeTab === 'map'} onClick={() => navigate('/map')}>
        <Map size={22} />
        <IonLabel>{t('nav.map')}</IonLabel>
      </IonTabButton>
      <IonTabButton
        tab="explore"
        selected={activeTab === 'explore'}
        onClick={() => navigate('/explore')}
      >
        <Search size={22} />
        <IonLabel>{t('nav.explore')}</IonLabel>
      </IonTabButton>
    </IonTabBar>
  )
}

export { TAB_BAR_HEIGHT }
export default AppTabs

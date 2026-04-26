import { IonIcon, IonLabel, IonTabBar, IonTabButton } from '@ionic/react'
import { mapOutline, searchOutline } from 'ionicons/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useIsMobile } from './useIsMobile'

const TAB_BAR_HEIGHT = 56
const TAB_ROUTES = ['/', '/map', '/explore']

function AppTabs() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()

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
        <IonIcon icon={mapOutline} />
        <IonLabel>Map</IonLabel>
      </IonTabButton>
      <IonTabButton
        tab="explore"
        selected={activeTab === 'explore'}
        onClick={() => navigate('/explore')}
      >
        <IonIcon icon={searchOutline} />
        <IonLabel>Explore</IonLabel>
      </IonTabButton>
    </IonTabBar>
  )
}

export { TAB_BAR_HEIGHT }
export default AppTabs

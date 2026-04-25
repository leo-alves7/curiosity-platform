import { IonIcon, IonLabel, IonTabBar, IonTabButton } from '@ionic/react'
import { mapOutline, searchOutline } from 'ionicons/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useIsMobile } from './useIsMobile'

function AppTabs() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()

  if (!isMobile) {
    return <Outlet />
  }

  const activeTab = location.pathname.startsWith('/explore') ? 'explore' : 'map'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Outlet />
      </div>
      <IonTabBar slot="bottom">
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
    </div>
  )
}

export default AppTabs

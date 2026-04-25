import { useState } from 'react'
import { IonFab, IonFabButton, IonIcon, IonToast } from '@ionic/react'
import { locate, locateOutline } from 'ionicons/icons'

interface UserLocation {
  lat: number
  lng: number
  accuracy: number
}

interface LocateMeFabProps {
  userLocation: UserLocation | null
  isFollowingUser: boolean
  onToggleFollow: (active: boolean) => void
}

function LocateMeFab({ userLocation, isFollowingUser, onToggleFollow }: LocateMeFabProps) {
  const hasLocation = userLocation !== null
  const [showSettingsToast, setShowSettingsToast] = useState(false)

  const handleClick = () => {
    if (!hasLocation) {
      navigator.geolocation.getCurrentPosition(
        () => {},
        (err) => {
          // PERMISSION_DENIED — browser will not re-prompt; user must go to settings
          if (err.code === 1) setShowSettingsToast(true)
        },
      )
      return
    }
    onToggleFollow(true)
  }

  return (
    <>
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton
          color={isFollowingUser ? 'primary' : 'medium'}
          title={!hasLocation ? 'Allow location access' : isFollowingUser ? 'Following' : 'Locate me'}
          onClick={handleClick}
        >
          <IonIcon
            icon={hasLocation ? locate : locateOutline}
            style={!hasLocation ? { color: 'var(--ion-color-danger)' } : undefined}
          />
        </IonFabButton>
      </IonFab>
      <IonToast
        isOpen={showSettingsToast}
        message="Location access is blocked. Enable it in your browser settings and reload."
        duration={4000}
        onDidDismiss={() => setShowSettingsToast(false)}
      />
    </>
  )
}

export default LocateMeFab

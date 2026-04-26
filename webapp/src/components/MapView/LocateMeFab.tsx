import { useState } from 'react'
import { IonFab, IonFabButton, IonToast } from '@ionic/react'
import { Locate, LocateOff } from 'lucide-react'

interface UserLocation {
  lat: number
  lng: number
  accuracy: number
}

interface LocateMeFabProps {
  userLocation: UserLocation | null
  isFollowingUser: boolean
  onToggleFollow: (active: boolean) => void
  bottomOffset?: number
}

function LocateMeFab({
  userLocation,
  isFollowingUser,
  onToggleFollow,
  bottomOffset = 0,
}: LocateMeFabProps) {
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
      <IonFab
        vertical="bottom"
        horizontal="end"
        slot="fixed"
        style={{ bottom: `${bottomOffset + 16}px` }}
      >
        <IonFabButton
          color={!hasLocation ? 'light' : isFollowingUser ? 'primary' : 'medium'}
          title={
            !hasLocation ? 'Allow location access' : isFollowingUser ? 'Following' : 'Locate me'
          }
          onClick={handleClick}
        >
          {hasLocation ? (
            <Locate size={22} />
          ) : (
            <LocateOff size={22} color="var(--ion-color-danger)" />
          )}
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

import { IonFab, IonFabButton, IonIcon } from '@ionic/react'
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

  const handleClick = () => {
    if (!hasLocation) {
      // Trigger the native browser permission prompt
      navigator.geolocation.getCurrentPosition(
        () => {},
        () => {},
      )
      return
    }
    onToggleFollow(!isFollowingUser)
  }

  return (
    <IonFab vertical="bottom" horizontal="end" slot="fixed">
      <IonFabButton
        color={!hasLocation ? 'danger' : isFollowingUser ? 'primary' : 'medium'}
        title={!hasLocation ? 'Allow location access' : isFollowingUser ? 'Following' : 'Locate me'}
        onClick={handleClick}
      >
        <IonIcon icon={hasLocation ? locate : locateOutline} />
      </IonFabButton>
    </IonFab>
  )
}

export default LocateMeFab

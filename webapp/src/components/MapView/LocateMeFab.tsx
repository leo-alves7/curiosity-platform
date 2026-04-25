import { IonFab, IonFabButton, IonIcon } from '@ionic/react'
import { location, locationOutline } from 'ionicons/icons'

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
  const isDisabled = userLocation === null

  return (
    <IonFab vertical="bottom" horizontal="end" slot="fixed">
      <IonFabButton
        disabled={isDisabled}
        color={isFollowingUser ? 'primary' : 'medium'}
        title={isDisabled ? 'Location unavailable' : isFollowingUser ? 'Following' : 'Locate me'}
        onClick={() => onToggleFollow(!isFollowingUser)}
      >
        <IonIcon icon={isFollowingUser ? location : locationOutline} />
      </IonFabButton>
    </IonFab>
  )
}

export default LocateMeFab

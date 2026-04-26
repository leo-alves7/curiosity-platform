import { useState } from 'react'
import { IonFab, IonFabButton, IonToast } from '@ionic/react'
import { Locate, LocateOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
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
      <IonFab style={{ position: 'absolute', bottom: `${bottomOffset + 16}px`, right: '16px' }}>
        <IonFabButton
          color={!hasLocation ? 'light' : isFollowingUser ? 'primary' : 'medium'}
          title={
            !hasLocation
              ? t('map.locateAllowAccess')
              : isFollowingUser
                ? t('map.locateFollowing')
                : t('map.locateMe')
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
        message={t('map.locationBlocked')}
        duration={4000}
        onDidDismiss={() => setShowSettingsToast(false)}
      />
    </>
  )
}

export default LocateMeFab

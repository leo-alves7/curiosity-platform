import { useState } from 'react'
import { IonButton } from '@ionic/react'
import { CircleUser } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface UserAvatarProps {
  photoURL: string | null
  uid: string
  onClick?: (e: React.MouseEvent) => void
}

function UserAvatar({ photoURL, onClick }: UserAvatarProps) {
  const { t } = useTranslation()
  const [photoError, setPhotoError] = useState(false)

  if (photoURL && !photoError) {
    return (
      <IonButton fill="clear" shape="round" onClick={onClick} aria-label={t('profile.userAvatar')}>
        <img
          src={photoURL}
          alt={t('profile.userAvatar')}
          onError={() => setPhotoError(true)}
          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
        />
      </IonButton>
    )
  }

  return (
    <IonButton fill="clear" shape="round" onClick={onClick} aria-label={t('profile.userAvatar')}>
      <CircleUser size={32} />
    </IonButton>
  )
}

export default UserAvatar

import { useState } from 'react'
import { IonButton, IonIcon } from '@ionic/react'
import { personCircle } from 'ionicons/icons'

interface UserAvatarProps {
  photoURL: string | null
  uid: string
  onClick?: (e: React.MouseEvent) => void
}

function UserAvatar({ photoURL, onClick }: UserAvatarProps) {
  const [photoError, setPhotoError] = useState(false)

  if (photoURL && !photoError) {
    return (
      <IonButton fill="clear" shape="round" onClick={onClick} aria-label="User avatar">
        <img
          src={photoURL}
          alt="User avatar"
          onError={() => setPhotoError(true)}
          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
        />
      </IonButton>
    )
  }

  return (
    <IonButton fill="clear" shape="round" onClick={onClick} aria-label="User avatar">
      <IonIcon icon={personCircle} style={{ fontSize: '32px' }} />
    </IonButton>
  )
}

export default UserAvatar

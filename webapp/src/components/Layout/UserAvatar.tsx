import { IonButton } from '@ionic/react'

interface UserAvatarProps {
  displayName: string | null
  email: string | null
  photoURL: string | null
  uid: string
  onClick?: (e: React.MouseEvent) => void
}

function UserAvatar({ displayName, email, photoURL, uid, onClick }: UserAvatarProps) {
  if (photoURL) {
    return (
      <IonButton fill="clear" shape="round" onClick={onClick} aria-label="User avatar">
        <img
          src={photoURL}
          alt="User avatar"
          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
        />
      </IonButton>
    )
  }

  const initial = (displayName ?? email ?? '?')[0].toUpperCase()
  const hue = uid.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  const bg = `hsl(${hue}, 60%, 50%)`

  return (
    <IonButton fill="clear" shape="round" onClick={onClick} aria-label="User avatar">
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: bg,
          color: 'var(--ion-color-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '14px',
        }}
      >
        {initial}
      </div>
    </IonButton>
  )
}

export default UserAvatar

import { IonPopover, IonList, IonItem, IonLabel } from '@ionic/react'

interface ProfileMenuProps {
  isOpen: boolean
  event: Event | undefined
  onDismiss: () => void
  displayName: string | null
  email: string | null
  onLogout: () => void
}

function ProfileMenu({ isOpen, event, onDismiss, displayName, email, onLogout }: ProfileMenuProps) {
  return (
    <IonPopover isOpen={isOpen} event={event} onDidDismiss={onDismiss}>
      <IonList lines="full">
        <IonItem detail={false}>
          <IonLabel>
            <p style={{ fontWeight: 'bold', color: 'var(--ion-text-color)' }}>
              {displayName ?? email}
            </p>
            <p style={{ color: 'var(--ion-color-medium)' }}>{email}</p>
          </IonLabel>
        </IonItem>
        <IonItem detail={false} disabled>
          <IonLabel>Settings</IonLabel>
        </IonItem>
        <IonItem detail={false} button onClick={onLogout}>
          <IonLabel color="danger">Logout</IonLabel>
        </IonItem>
      </IonList>
    </IonPopover>
  )
}

export default ProfileMenu

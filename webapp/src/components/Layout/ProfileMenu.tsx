import { IonItem, IonLabel, IonList, IonPopover, IonSelect, IonSelectOption } from '@ionic/react'
import { useDispatch, useSelector } from 'react-redux'
import { selectTheme, setTheme, type ThemePreference } from '@/slices/settingsSlice'
import type { AppDispatch } from '@/store'

interface ProfileMenuProps {
  isOpen: boolean
  event: Event | undefined
  onDismiss: () => void
  displayName: string | null
  email: string | null
  onLogout: () => void
}

function ProfileMenu({ isOpen, event, onDismiss, displayName, email, onLogout }: ProfileMenuProps) {
  const dispatch = useDispatch<AppDispatch>()
  const theme = useSelector(selectTheme)

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
        <IonItem detail={false}>
          <IonLabel>Theme</IonLabel>
          <IonSelect
            value={theme}
            onIonChange={(e) => dispatch(setTheme(e.detail.value as ThemePreference))}
            slot="end"
            interface="popover"
          >
            <IonSelectOption value="light">Light</IonSelectOption>
            <IonSelectOption value="dark">Dark</IonSelectOption>
            <IonSelectOption value="system">System</IonSelectOption>
          </IonSelect>
        </IonItem>
        <IonItem detail={false} button onClick={onLogout}>
          <IonLabel color="danger">Logout</IonLabel>
        </IonItem>
      </IonList>
    </IonPopover>
  )
}

export default ProfileMenu

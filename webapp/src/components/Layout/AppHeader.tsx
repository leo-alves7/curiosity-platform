import { useState } from 'react'
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonToast } from '@ionic/react'
import { useSelector, useDispatch } from 'react-redux'
import { FirebaseAuthentication } from '@capacitor-firebase/authentication'
import UserAvatar from './UserAvatar'
import ProfileMenu from './ProfileMenu'
import { clearAuth } from '@/slices/authSlice'
import type { RootState } from '@/store'

function AppHeader() {
  const dispatch = useDispatch()
  const { uid, email, displayName, photoURL } = useSelector((state: RootState) => state.auth)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuEvent, setMenuEvent] = useState<Event | undefined>(undefined)
  const [showLogoutToast, setShowLogoutToast] = useState(false)

  const handleAvatarClick = (e: React.MouseEvent) => {
    setMenuEvent(e.nativeEvent)
    setMenuOpen(true)
  }

  const handleLogout = async () => {
    await FirebaseAuthentication.signOut()
    dispatch(clearAuth())
    setMenuOpen(false)
    setShowLogoutToast(true)
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Curiosity</IonTitle>
          <IonButtons slot="end">
            <UserAvatar
              displayName={displayName}
              email={email}
              photoURL={photoURL}
              uid={uid ?? ''}
              onClick={handleAvatarClick}
            />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <ProfileMenu
        isOpen={menuOpen}
        event={menuEvent}
        onDismiss={() => setMenuOpen(false)}
        displayName={displayName}
        email={email}
        onLogout={handleLogout}
      />
      <IonToast
        isOpen={showLogoutToast}
        message="You have been signed out"
        duration={3000}
        onDidDismiss={() => setShowLogoutToast(false)}
      />
    </>
  )
}

export default AppHeader

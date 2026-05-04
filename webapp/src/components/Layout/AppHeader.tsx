import { useCallback, useEffect, useState } from 'react'
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonSearchbar,
  IonToast,
} from '@ionic/react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FirebaseAuthentication } from '@capacitor-firebase/authentication'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import UserAvatar from './UserAvatar'
import ProfileMenu from './ProfileMenu'
import { clearAuth } from '@/slices/authSlice'
import { useSearchDebounce } from '@/hooks/useSearchDebounce'
import { useAnalytics } from '@/hooks/useAnalytics'
import type { RootState } from '@/store'
import type { AppDispatch } from '@/store'

export interface AppHeaderProps {
  showSidebarToggle?: boolean
  isSidebarCollapsed?: boolean
  onToggleSidebar?: () => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

function AppHeader({
  showSidebarToggle = false,
  isSidebarCollapsed = false,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
}: AppHeaderProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslation()
  const { uid, email, displayName, photoURL } = useSelector((state: RootState) => state.auth)
  const { trackSearchPerformed } = useAnalytics()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuEvent, setMenuEvent] = useState<Event | undefined>(undefined)
  const [showLogoutToast, setShowLogoutToast] = useState(false)
  const [localQuery, setLocalQuery] = useState(searchQuery ?? '')

  useEffect(() => {
    setLocalQuery(searchQuery ?? '')
  }, [searchQuery])

  const handleSearchChange = useCallback(
    (q: string) => {
      const cb = onSearchChange ?? (() => {})
      cb(q)
      if (q.length > 0) trackSearchPerformed(q.length)
    },
    [onSearchChange, trackSearchPerformed],
  )

  useSearchDebounce(localQuery, 300, handleSearchChange)

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
          {showSidebarToggle && (
            <IonButtons slot="start">
              <IonButton
                fill="clear"
                aria-label={
                  isSidebarCollapsed ? t('storeList.expandSidebar') : t('storeList.collapseSidebar')
                }
                onClick={onToggleSidebar}
              >
                {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
              </IonButton>
            </IonButtons>
          )}
          {onSearchChange ? (
            <IonSearchbar
              aria-label={t('storeList.search')}
              value={localQuery}
              placeholder={t('storeList.search')}
              debounce={0}
              onIonInput={(e) => setLocalQuery(e.detail.value ?? '')}
              style={{ maxWidth: 400, flex: 1 }}
            />
          ) : (
            <IonTitle>{t('app.title')}</IonTitle>
          )}
          <IonButtons slot="end">
            <UserAvatar photoURL={photoURL} uid={uid ?? ''} onClick={handleAvatarClick} />
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
        message={t('auth.signedOut')}
        duration={3000}
        onDidDismiss={() => setShowLogoutToast(false)}
      />
    </>
  )
}

export default AppHeader

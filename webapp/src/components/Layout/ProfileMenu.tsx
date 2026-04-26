import { IonItem, IonLabel, IonList, IonPopover, IonSelect, IonSelectOption } from '@ionic/react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  selectTheme,
  setTheme,
  type ThemePreference,
  selectLanguage,
  setLanguage,
  type LanguagePreference,
} from '@/slices/settingsSlice'
import i18n from '@/i18n/index'
import { detectLanguage } from '@/i18n/detectLanguage'
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
  const { t } = useTranslation()
  const theme = useSelector(selectTheme)
  const language = useSelector(selectLanguage)

  function handleLanguageChange(val: 'en' | 'pt-BR' | 'auto') {
    const pref: LanguagePreference = val === 'auto' ? null : val
    dispatch(setLanguage(pref))
    i18n.changeLanguage(pref ?? detectLanguage())
  }

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
          <IonLabel>{t('profile.theme')}</IonLabel>
          <IonSelect
            value={theme}
            onIonChange={(e) => dispatch(setTheme(e.detail.value as ThemePreference))}
            slot="end"
            interface="popover"
          >
            <IonSelectOption value="light">{t('profile.themeLight')}</IonSelectOption>
            <IonSelectOption value="dark">{t('profile.themeDark')}</IonSelectOption>
            <IonSelectOption value="system">{t('profile.themeSystem')}</IonSelectOption>
          </IonSelect>
        </IonItem>
        <IonItem detail={false}>
          <IonLabel>{t('profile.language')}</IonLabel>
          <IonSelect
            value={language ?? 'auto'}
            onIonChange={(e) => handleLanguageChange(e.detail.value as 'en' | 'pt-BR' | 'auto')}
            slot="end"
            interface="popover"
          >
            <IonSelectOption value="en">{t('profile.languageEn')}</IonSelectOption>
            <IonSelectOption value="pt-BR">{t('profile.languagePtBR')}</IonSelectOption>
            <IonSelectOption value="auto">{t('profile.languageAuto')}</IonSelectOption>
          </IonSelect>
        </IonItem>
        <IonItem detail={false} button onClick={onLogout}>
          <IonLabel color="danger">{t('profile.logout')}</IonLabel>
        </IonItem>
      </IonList>
    </IonPopover>
  )
}

export default ProfileMenu

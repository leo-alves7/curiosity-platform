import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react'
import { useTranslation } from 'react-i18next'
import { RootState } from '../store'
import LoginForm from '../features/auth/LoginForm'

function LoginPage() {
  const { t } = useTranslation()
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const [mode, setMode] = useState<'signIn' | 'register'>('signIn')

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{mode === 'signIn' ? t('auth.signIn') : t('auth.createAccount')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <LoginForm onModeChange={setMode} />
      </IonContent>
    </IonPage>
  )
}

export default LoginPage

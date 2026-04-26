import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FirebaseAuthentication } from '@capacitor-firebase/authentication'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
} from '@ionic/react'
import { useTranslation } from 'react-i18next'
import { RootState } from '../store'

function LoginPage() {
  const { t } = useTranslation()
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleEmailSignIn = async () => {
    setError(null)
    setLoading(true)
    try {
      await FirebaseAuthentication.signInWithEmailAndPassword({ email, password })
    } catch {
      setError(t('auth.invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    try {
      await FirebaseAuthentication.signInWithGoogle()
    } catch {
      setError(t('auth.googleFailed'))
    }
  }

  const handleAppleSignIn = async () => {
    setError(null)
    try {
      await FirebaseAuthentication.signInWithApple()
    } catch {
      setError(t('auth.appleFailed'))
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('auth.signIn')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">{t('auth.emailLabel')}</IonLabel>
          <IonInput type="email" value={email} onIonInput={(e) => setEmail(e.detail.value ?? '')} />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">{t('auth.passwordLabel')}</IonLabel>
          <IonInput
            type="password"
            value={password}
            onIonInput={(e) => setPassword(e.detail.value ?? '')}
          />
        </IonItem>
        {error && (
          <IonText color="danger">
            <p className="ion-padding-start">{error}</p>
          </IonText>
        )}
        <IonButton
          expand="block"
          onClick={handleEmailSignIn}
          disabled={loading}
          className="ion-margin-top"
        >
          {loading ? <IonSpinner name="dots" /> : t('auth.signInWithEmail')}
        </IonButton>
        <IonButton expand="block" fill="outline" onClick={handleGoogleSignIn} disabled={loading}>
          {t('auth.signInWithGoogle')}
        </IonButton>
        <IonButton expand="block" fill="outline" onClick={handleAppleSignIn} disabled={loading}>
          {t('auth.signInWithApple')}
        </IonButton>
      </IonContent>
    </IonPage>
  )
}

export default LoginPage

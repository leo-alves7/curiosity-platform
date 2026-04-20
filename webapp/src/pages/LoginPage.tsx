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
import { RootState } from '../store'

function LoginPage() {
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
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    try {
      await FirebaseAuthentication.signInWithGoogle()
    } catch {
      setError('Google sign-in failed')
    }
  }

  const handleAppleSignIn = async () => {
    setError(null)
    try {
      await FirebaseAuthentication.signInWithApple()
    } catch {
      setError('Apple sign-in failed')
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Sign In</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Email</IonLabel>
          <IonInput type="email" value={email} onIonInput={(e) => setEmail(e.detail.value ?? '')} />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Password</IonLabel>
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
          {loading ? <IonSpinner name="dots" /> : 'Sign in with Email'}
        </IonButton>
        <IonButton expand="block" fill="outline" onClick={handleGoogleSignIn} disabled={loading}>
          Sign in with Google
        </IonButton>
        <IonButton expand="block" fill="outline" onClick={handleAppleSignIn} disabled={loading}>
          Sign in with Apple
        </IonButton>
      </IonContent>
    </IonPage>
  )
}

export default LoginPage

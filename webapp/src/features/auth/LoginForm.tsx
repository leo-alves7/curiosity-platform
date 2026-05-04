import { useState } from 'react'
import {
  IonCard,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
} from '@ionic/react'
import { useTranslation } from 'react-i18next'
import { Mail, KeyRound, UserPlus } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { useAnalytics } from '../../hooks/useAnalytics'

interface LoginFormProps {
  onModeChange: (mode: 'signIn' | 'register') => void
}

function LoginForm({ onModeChange }: LoginFormProps) {
  const { t } = useTranslation()
  const {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithGoogle,
    signInWithApple,
  } = useAuth()
  const { trackLoginCompleted, trackRegistrationCompleted } = useAnalytics()
  const [mode, setMode] = useState<'signIn' | 'register'>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleEmailSignIn = async () => {
    setError(null)
    setLoading(true)
    try {
      await signInWithEmailAndPassword(email, password)
      trackLoginCompleted('email')
    } catch {
      setError(t('auth.invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    setError(null)
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'))
      return
    }
    setLoading(true)
    try {
      await createUserWithEmailAndPassword(email, password)
      trackRegistrationCompleted()
    } catch (err) {
      const code = (err as { code?: string }).code
      if (code === 'auth/email-already-in-use') {
        setError(t('auth.emailAlreadyInUse'))
      } else if (code === 'auth/weak-password') {
        setError(t('auth.weakPassword'))
      } else if (code === 'auth/invalid-email') {
        setError(t('auth.invalidEmail'))
      } else {
        setError(t('auth.invalidCredentials'))
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    const newMode = mode === 'signIn' ? 'register' : 'signIn'
    setMode(newMode)
    onModeChange(newMode)
    setError(null)
    setConfirmPassword('')
  }

  return (
    <IonCard style={{ maxWidth: 420, margin: '0 auto' }}>
      <IonCardContent>
        <IonItem>
          <IonInput
            label={t('auth.emailLabel')}
            labelPlacement="stacked"
            type="email"
            value={email}
            onIonInput={(e) => setEmail(e.detail.value ?? '')}
          />
        </IonItem>
        <IonItem>
          <IonInput
            label={t('auth.passwordLabel')}
            labelPlacement="stacked"
            type="password"
            value={password}
            onIonInput={(e) => setPassword(e.detail.value ?? '')}
          />
        </IonItem>
        {mode === 'register' && (
          <IonItem>
            <IonInput
              label={t('auth.confirmPasswordLabel')}
              labelPlacement="stacked"
              type="password"
              value={confirmPassword}
              onIonInput={(e) => setConfirmPassword(e.detail.value ?? '')}
            />
          </IonItem>
        )}
        {error && (
          <IonText color="danger">
            <p className="ion-padding-start">{error}</p>
          </IonText>
        )}
        <IonButton
          expand="block"
          onClick={mode === 'signIn' ? handleEmailSignIn : handleRegister}
          disabled={loading}
          className="ion-margin-top"
        >
          {loading ? (
            <IonSpinner name="dots" />
          ) : (
            <>
              <Mail size={18} />
              &nbsp;
              {mode === 'signIn' ? t('auth.signInWithEmail') : t('auth.registerWithEmail')}
            </>
          )}
        </IonButton>
        <IonButton
          expand="block"
          fill="outline"
          onClick={async () => {
            await signInWithGoogle()
            trackLoginCompleted('google')
          }}
          disabled={loading}
        >
          <KeyRound size={18} />
          &nbsp;{t('auth.signInWithGoogle')}
        </IonButton>
        <IonButton
          expand="block"
          fill="outline"
          onClick={async () => {
            await signInWithApple()
            trackLoginCompleted('apple')
          }}
          disabled={loading}
        >
          <UserPlus size={18} />
          &nbsp;{t('auth.signInWithApple')}
        </IonButton>
        <IonButton expand="block" fill="clear" onClick={toggleMode}>
          {mode === 'signIn' ? t('auth.createAccountToggle') : t('auth.signInToggle')}
        </IonButton>
      </IonCardContent>
    </IonCard>
  )
}

export default LoginForm

import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { FirebaseAuthentication } from '@capacitor-firebase/authentication'
import { useDispatch } from 'react-redux'
import { auth } from './firebase'
import { setAuth, clearAuth } from '../slices/authSlice'

interface AuthHook {
  currentUser: User | null
  idToken: string | null
  isLoading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
  signInWithEmailAndPassword: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export function useAuth(): AuthHook {
  const dispatch = useDispatch()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [idToken, setIdToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        const tokenResult = await user.getIdTokenResult()
        setIdToken(tokenResult.token)
        const isAdmin = tokenResult.claims['role'] === 'admin'
        dispatch(setAuth({ uid: user.uid, email: user.email ?? '', isAdmin }))
      } else {
        setIdToken(null)
        dispatch(clearAuth())
      }
      setIsLoading(false)
    })
    return unsubscribe
  }, [dispatch])

  const signInWithGoogle = async () => {
    await FirebaseAuthentication.signInWithGoogle()
  }

  const signInWithApple = async () => {
    await FirebaseAuthentication.signInWithApple()
  }

  const signInWithEmailAndPassword = async (email: string, password: string) => {
    await FirebaseAuthentication.signInWithEmailAndPassword({ email, password })
  }

  const signOut = async () => {
    await FirebaseAuthentication.signOut()
  }

  return {
    currentUser,
    idToken,
    isLoading,
    signInWithGoogle,
    signInWithApple,
    signInWithEmailAndPassword,
    signOut,
  }
}

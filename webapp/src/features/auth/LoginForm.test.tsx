import '@/i18n/index'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import authReducer from '@/slices/authSlice'
import LoginForm from './LoginForm'

vi.mock('../../auth/firebase', () => ({
  auth: {},
  analytics: null,
}))
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(() => vi.fn()),
}))
vi.mock('@capacitor-firebase/authentication', () => ({
  FirebaseAuthentication: {
    signInWithGoogle: vi.fn(),
    signInWithApple: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
  },
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function setup(onModeChange = vi.fn()) {
  const store = configureStore({ reducer: { auth: authReducer } })
  const result = render(
    <Provider store={store}>
      <MemoryRouter>
        <LoginForm onModeChange={onModeChange} />
      </MemoryRouter>
    </Provider>,
  )
  return { store, onModeChange, ...result }
}

function fillInput(container: HTMLElement, label: string, value: string) {
  const ionInputs = container.querySelectorAll('ion-input')
  let target: Element | null = null
  for (const el of ionInputs) {
    if (el.getAttribute('label') === label) {
      target = el
      break
    }
  }
  if (!target) throw new Error(`IonInput with label "${label}" not found`)
  fireEvent(target, new CustomEvent('ionInput', { detail: { value }, bubbles: true }))
}

describe('LoginForm', () => {
  it('renders email and password fields in sign-in mode', () => {
    const { container } = setup()
    const ionInputs = container.querySelectorAll('ion-input')
    const labels = Array.from(ionInputs).map((el) => el.getAttribute('label'))
    expect(labels).toContain('Email')
    expect(labels).toContain('Password')
  })

  it('does not render confirm-password field in sign-in mode', () => {
    const { container } = setup()
    const ionInputs = container.querySelectorAll('ion-input')
    const labels = Array.from(ionInputs).map((el) => el.getAttribute('label'))
    expect(labels).not.toContain('Confirm password')
  })

  it('shows confirm-password field after toggling to create-account mode', async () => {
    const user = userEvent.setup()
    const { container } = setup()
    await user.click(screen.getByText("Don't have an account? Create one"))
    const ionInputs = container.querySelectorAll('ion-input')
    const labels = Array.from(ionInputs).map((el) => el.getAttribute('label'))
    expect(labels).toContain('Confirm password')
  })

  it('shows passwordMismatch error when passwords differ on register', async () => {
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
    const user = userEvent.setup()
    const { container } = setup()
    await user.click(screen.getByText("Don't have an account? Create one"))
    fillInput(container, 'Email', 'test@test.com')
    fillInput(container, 'Password', 'password1')
    fillInput(container, 'Confirm password', 'password2')
    await user.click(screen.getByText('Create account'))
    expect(screen.getByText('Passwords do not match')).toBeDefined()
    expect(FirebaseAuthentication.createUserWithEmailAndPassword).not.toHaveBeenCalled()
  })

  it('calls FirebaseAuthentication.createUserWithEmailAndPassword when passwords match', async () => {
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
    const user = userEvent.setup()
    const { container } = setup()
    await user.click(screen.getByText("Don't have an account? Create one"))
    fillInput(container, 'Email', 'new@test.com')
    fillInput(container, 'Password', 'pass123')
    fillInput(container, 'Confirm password', 'pass123')
    await user.click(screen.getByText('Create account'))
    await waitFor(() =>
      expect(FirebaseAuthentication.createUserWithEmailAndPassword).toHaveBeenCalledWith({
        email: 'new@test.com',
        password: 'pass123',
      }),
    )
  })

  it('shows emailAlreadyInUse error when Firebase rejects with auth/email-already-in-use', async () => {
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
    vi.mocked(FirebaseAuthentication.createUserWithEmailAndPassword).mockRejectedValueOnce({
      code: 'auth/email-already-in-use',
    })
    const user = userEvent.setup()
    const { container } = setup()
    await user.click(screen.getByText("Don't have an account? Create one"))
    fillInput(container, 'Email', 'used@test.com')
    fillInput(container, 'Password', 'pass123')
    fillInput(container, 'Confirm password', 'pass123')
    await user.click(screen.getByText('Create account'))
    await waitFor(() => expect(screen.getByText('Email address is already in use')).toBeDefined())
  })

  it('shows weakPassword error when Firebase rejects with auth/weak-password', async () => {
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
    vi.mocked(FirebaseAuthentication.createUserWithEmailAndPassword).mockRejectedValueOnce({
      code: 'auth/weak-password',
    })
    const user = userEvent.setup()
    const { container } = setup()
    await user.click(screen.getByText("Don't have an account? Create one"))
    fillInput(container, 'Email', 'test@test.com')
    fillInput(container, 'Password', 'ab')
    fillInput(container, 'Confirm password', 'ab')
    await user.click(screen.getByText('Create account'))
    await waitFor(() =>
      expect(screen.getByText('Password is too weak (minimum 6 characters)')).toBeDefined(),
    )
  })

  it('shows invalidCredentials error on failed sign-in', async () => {
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
    vi.mocked(FirebaseAuthentication.signInWithEmailAndPassword).mockRejectedValueOnce({
      code: 'auth/wrong-password',
    })
    const user = userEvent.setup()
    const { container } = setup()
    fillInput(container, 'Email', 'test@test.com')
    fillInput(container, 'Password', 'wrongpass')
    await user.click(screen.getByText('Sign in with Email'))
    await waitFor(() => expect(screen.getByText('Invalid email or password')).toBeDefined())
  })

  it('calls FirebaseAuthentication.signInWithEmailAndPassword in sign-in mode', async () => {
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
    const user = userEvent.setup()
    const { container } = setup()
    fillInput(container, 'Email', 'user@test.com')
    fillInput(container, 'Password', 'mypassword')
    await user.click(screen.getByText('Sign in with Email'))
    await waitFor(() =>
      expect(FirebaseAuthentication.signInWithEmailAndPassword).toHaveBeenCalledWith({
        email: 'user@test.com',
        password: 'mypassword',
      }),
    )
  })

  it('renders Google and Apple buttons in sign-in mode', () => {
    setup()
    expect(screen.getByText('Sign in with Google')).toBeDefined()
    expect(screen.getByText('Sign in with Apple')).toBeDefined()
  })

  it('renders Google and Apple buttons in register mode', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByText("Don't have an account? Create one"))
    expect(screen.getByText('Sign in with Google')).toBeDefined()
    expect(screen.getByText('Sign in with Apple')).toBeDefined()
  })

  it('shows loading spinner during async sign-in', async () => {
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
    vi.mocked(FirebaseAuthentication.signInWithEmailAndPassword).mockImplementationOnce(
      () => new Promise(() => {}),
    )
    const user = userEvent.setup()
    const { container } = setup()
    fillInput(container, 'Email', 'user@test.com')
    fillInput(container, 'Password', 'mypassword')
    await user.click(screen.getByText('Sign in with Email'))
    await waitFor(() => expect(container.querySelector('ion-spinner')).toBeDefined())
  })
})

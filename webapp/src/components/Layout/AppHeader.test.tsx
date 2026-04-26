import '@/i18n/index'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import authReducer from '@/slices/authSlice'
import AppHeader from './AppHeader'

vi.mock('@capacitor-firebase/authentication', () => ({
  FirebaseAuthentication: {
    signOut: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('./ProfileMenu', () => ({
  default: ({ isOpen, onLogout }: { isOpen: boolean; onLogout: () => void }) =>
    isOpen ? (
      <div data-testid="profile-menu">
        <button onClick={onLogout}>Logout</button>
      </div>
    ) : null,
}))

function makeStore() {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        uid: 'uid-1',
        email: 'alice@example.com',
        displayName: 'Alice',
        photoURL: null,
        isAdmin: false,
      },
    },
  })
}

function setup() {
  const store = makeStore()
  const result = render(
    <Provider store={store}>
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>
    </Provider>,
  )
  return { store, ...result }
}

describe('AppHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the app title', () => {
    setup()
    expect(screen.getByText('Curiosity')).toBeDefined()
  })

  it('renders a UserAvatar button', () => {
    const { container } = setup()
    expect(container.querySelector('ion-button[aria-label="User avatar"]')).not.toBeNull()
  })

  it('opens ProfileMenu when avatar is clicked', () => {
    const { container } = setup()
    const avatarBtn = container.querySelector('ion-button[aria-label="User avatar"]') as HTMLElement
    fireEvent.click(avatarBtn)
    expect(screen.getByText('Logout')).toBeDefined()
  })

  it('calls FirebaseAuthentication.signOut on logout', async () => {
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
    const { container } = setup()
    const avatarBtn = container.querySelector('ion-button[aria-label="User avatar"]') as HTMLElement
    fireEvent.click(avatarBtn)
    await userEvent.setup().click(screen.getByText('Logout'))
    expect(FirebaseAuthentication.signOut).toHaveBeenCalled()
  })

  it('dispatches clearAuth to Redux store after logout', async () => {
    const { store, container } = setup()
    const avatarBtn = container.querySelector('ion-button[aria-label="User avatar"]') as HTMLElement
    fireEvent.click(avatarBtn)
    await userEvent.setup().click(screen.getByText('Logout'))
    expect(store.getState().auth.isAuthenticated).toBe(false)
  })

  it('shows IonToast after logout', async () => {
    const { container } = setup()
    const avatarBtn = container.querySelector('ion-button[aria-label="User avatar"]') as HTMLElement
    fireEvent.click(avatarBtn)
    await userEvent.setup().click(screen.getByText('Logout'))
    expect(
      container.querySelector('ion-toast') ?? document.body.querySelector('ion-toast'),
    ).not.toBeNull()
  })
})

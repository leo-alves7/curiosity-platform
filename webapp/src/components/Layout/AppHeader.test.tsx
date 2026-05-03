import '@/i18n/index'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import authReducer from '@/slices/authSlice'
import AppHeader from './AppHeader'
import type { AppHeaderProps } from './AppHeader'

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

function setup(props: AppHeaderProps = {}) {
  const store = makeStore()
  const result = render(
    <Provider store={store}>
      <MemoryRouter>
        <AppHeader {...props} />
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

  describe('sidebar toggle', () => {
    it('does not render toggle button when showSidebarToggle is false', () => {
      setup()
      expect(screen.queryByLabelText('Collapse sidebar')).toBeNull()
    })

    it('renders collapse button when sidebar is expanded', () => {
      setup({ showSidebarToggle: true, isSidebarCollapsed: false, onToggleSidebar: vi.fn() })
      expect(screen.getByLabelText('Collapse sidebar')).toBeDefined()
    })

    it('renders expand button when sidebar is collapsed', () => {
      setup({ showSidebarToggle: true, isSidebarCollapsed: true, onToggleSidebar: vi.fn() })
      expect(screen.getByLabelText('Expand sidebar')).toBeDefined()
    })

    it('calls onToggleSidebar when toggle button is clicked', async () => {
      const onToggleSidebar = vi.fn()
      setup({ showSidebarToggle: true, isSidebarCollapsed: false, onToggleSidebar })
      const btn = screen.getByLabelText('Collapse sidebar')
      await userEvent.setup().click(btn)
      expect(onToggleSidebar).toHaveBeenCalledOnce()
    })
  })

  describe('desktop search bar', () => {
    it('does not render searchbar when onSearchChange is not provided', () => {
      const { container } = setup()
      expect(container.querySelector('ion-searchbar')).toBeNull()
    })

    it('renders searchbar when onSearchChange is provided', () => {
      setup({ onSearchChange: vi.fn(), searchQuery: '' })
      expect(screen.getByLabelText('Search stores')).toBeDefined()
    })

    it('calls onSearchChange after debounce elapses', async () => {
      vi.useFakeTimers()
      const onSearchChange = vi.fn()
      const { container } = setup({ onSearchChange, searchQuery: '' })
      const searchbar = container.querySelector('ion-searchbar') as unknown as HTMLElement
      act(() => {
        fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: 'pizza' } }))
      })
      expect(onSearchChange).not.toHaveBeenCalledWith('pizza')
      act(() => {
        vi.advanceTimersByTime(300)
      })
      expect(onSearchChange).toHaveBeenCalledWith('pizza')
      vi.useRealTimers()
    })
  })
})

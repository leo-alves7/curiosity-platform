import '@/i18n/index'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import settingsReducer from '@/slices/settingsSlice'
import ProfileMenu from './ProfileMenu'

vi.mock('@ionic/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ionic/react')>()
  return {
    ...actual,
    IonPopover: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
      isOpen ? <>{children}</> : null,
  }
})

function makeStore(theme: 'light' | 'dark' | 'system' = 'system') {
  return configureStore({
    reducer: { settings: settingsReducer },
    preloadedState: { settings: { theme, language: null } },
  })
}

function setup(props: Partial<React.ComponentProps<typeof ProfileMenu>> = {}) {
  const store = makeStore()
  const result = render(
    <Provider store={store}>
      <ProfileMenu
        isOpen={true}
        event={undefined}
        onDismiss={vi.fn()}
        displayName="Alice"
        email="alice@example.com"
        onLogout={vi.fn()}
        {...props}
      />
    </Provider>,
  )
  return { store, ...result }
}

describe('ProfileMenu', () => {
  it('renders display name and email in the info row', () => {
    setup()
    expect(screen.getByText('Alice')).toBeDefined()
    expect(screen.getAllByText('alice@example.com').length).toBeGreaterThan(0)
  })

  it('renders ion-select for theme', () => {
    const { container } = setup()
    expect(container.querySelector('ion-select')).not.toBeNull()
  })

  it('calls onLogout when Logout item is clicked', () => {
    const onLogout = vi.fn()
    const { container } = setup({ onLogout })
    const logoutItem = container.querySelector('ion-item[button="true"]') as HTMLElement
    fireEvent.click(logoutItem)
    expect(onLogout).toHaveBeenCalled()
  })

  it('does not render content when isOpen is false', () => {
    const store = makeStore()
    const { container } = render(
      <Provider store={store}>
        <ProfileMenu
          isOpen={false}
          event={undefined}
          onDismiss={vi.fn()}
          displayName="Alice"
          email="alice@example.com"
          onLogout={vi.fn()}
        />
      </Provider>,
    )
    expect(container.querySelector('ion-list')).toBeNull()
  })

  it('dispatches setTheme when IonSelect changes', () => {
    const { store, container } = setup()
    const select = container.querySelector('ion-select') as HTMLElement
    fireEvent(select, new CustomEvent('ionChange', { detail: { value: 'dark' }, bubbles: true }))
    expect(store.getState().settings.theme).toBe('dark')
  })
})

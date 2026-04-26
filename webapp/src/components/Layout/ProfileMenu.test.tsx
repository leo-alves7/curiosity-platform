import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProfileMenu from './ProfileMenu'

vi.mock('@ionic/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ionic/react')>()
  return {
    ...actual,
    IonPopover: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
      isOpen ? <>{children}</> : null,
  }
})

describe('ProfileMenu', () => {
  it('renders display name and email in the info row', () => {
    render(
      <ProfileMenu
        isOpen={true}
        event={undefined}
        onDismiss={vi.fn()}
        displayName="Alice"
        email="alice@example.com"
        onLogout={vi.fn()}
      />,
    )
    expect(screen.getByText('Alice')).toBeDefined()
    expect(screen.getAllByText('alice@example.com').length).toBeGreaterThan(0)
  })

  it('renders Settings item as disabled', () => {
    const { container } = render(
      <ProfileMenu
        isOpen={true}
        event={undefined}
        onDismiss={vi.fn()}
        displayName="Alice"
        email="alice@example.com"
        onLogout={vi.fn()}
      />,
    )
    const settingsItem = container.querySelector('ion-item[disabled]')
    expect(settingsItem).not.toBeNull()
  })

  it('calls onLogout when Logout item is clicked', () => {
    const onLogout = vi.fn()
    const { container } = render(
      <ProfileMenu
        isOpen={true}
        event={undefined}
        onDismiss={vi.fn()}
        displayName="Alice"
        email="alice@example.com"
        onLogout={onLogout}
      />,
    )
    const logoutItem = container.querySelector('ion-item[button="true"]') as HTMLElement
    fireEvent.click(logoutItem)
    expect(onLogout).toHaveBeenCalled()
  })

  it('does not render content when isOpen is false', () => {
    const { container } = render(
      <ProfileMenu
        isOpen={false}
        event={undefined}
        onDismiss={vi.fn()}
        displayName="Alice"
        email="alice@example.com"
        onLogout={vi.fn()}
      />,
    )
    expect(container.querySelector('ion-list')).toBeNull()
  })
})

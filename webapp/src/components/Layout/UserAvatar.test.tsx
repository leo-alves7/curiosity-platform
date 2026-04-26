import '@/i18n/index'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import UserAvatar from './UserAvatar'

describe('UserAvatar', () => {
  it('renders an img when photoURL is provided', () => {
    render(<UserAvatar photoURL="https://photo.url/avatar.jpg" uid="uid-1" />)
    expect(screen.getByRole('img')).toBeDefined()
  })

  it('renders default icon when photoURL is null', () => {
    const { container } = render(<UserAvatar photoURL={null} uid="uid-1" />)
    expect(container.querySelector('ion-icon')).not.toBeNull()
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('renders default icon when image fails to load', () => {
    const { container } = render(
      <UserAvatar photoURL="https://broken.url/avatar.jpg" uid="uid-1" />,
    )
    const img = screen.getByRole('img') as HTMLImageElement
    fireEvent.error(img)
    expect(container.querySelector('ion-icon')).not.toBeNull()
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('calls onClick when avatar button is pressed', () => {
    const handleClick = vi.fn()
    const { container } = render(<UserAvatar photoURL={null} uid="uid-1" onClick={handleClick} />)
    const btn = container.querySelector('ion-button[aria-label="User avatar"]') as HTMLElement
    fireEvent.click(btn)
    expect(handleClick).toHaveBeenCalled()
  })
})

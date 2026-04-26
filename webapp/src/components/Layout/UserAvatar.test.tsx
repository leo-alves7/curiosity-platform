import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import UserAvatar from './UserAvatar'

describe('UserAvatar', () => {
  it('renders an img when photoURL is provided', () => {
    render(
      <UserAvatar
        displayName="Alice"
        email="alice@example.com"
        photoURL="https://photo.url/avatar.jpg"
        uid="uid-1"
      />,
    )
    expect(screen.getByRole('img')).toBeDefined()
  })

  it('renders initials from displayName when no photoURL', () => {
    render(<UserAvatar displayName="Alice" email="alice@example.com" photoURL={null} uid="uid-1" />)
    expect(screen.getByText('A')).toBeDefined()
  })

  it('renders initials from email when displayName is null', () => {
    render(<UserAvatar displayName={null} email="bob@example.com" photoURL={null} uid="uid-2" />)
    expect(screen.getByText('B')).toBeDefined()
  })

  it('renders uppercase initials', () => {
    render(<UserAvatar displayName="alice" email="alice@example.com" photoURL={null} uid="uid-1" />)
    const text = screen.getByText('A')
    expect(text.textContent).toBe('A')
  })

  it('applies background color based on uid', () => {
    const { container } = render(
      <UserAvatar displayName="Alice" email="alice@example.com" photoURL={null} uid="uid-1" />,
    )
    const div = container.querySelector('div[style]') as HTMLElement
    expect(div.style.backgroundColor).toBeTruthy()
    expect(div.style.backgroundColor).not.toBe('')
  })

  it('calls onClick when avatar button is pressed', () => {
    const handleClick = vi.fn()
    const { container } = render(
      <UserAvatar
        displayName="Alice"
        email="alice@example.com"
        photoURL={null}
        uid="uid-1"
        onClick={handleClick}
      />,
    )
    const btn = container.querySelector('ion-button[aria-label="User avatar"]') as HTMLElement
    fireEvent.click(btn)
    expect(handleClick).toHaveBeenCalled()
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createElement } from 'react'
import LocateMeFab from './LocateMeFab'

function setup(overrides: Partial<Parameters<typeof LocateMeFab>[0]> = {}) {
  const defaults = {
    userLocation: null,
    isFollowingUser: false,
    onToggleFollow: vi.fn(),
  }
  const props = { ...defaults, ...overrides }
  const result = render(createElement(LocateMeFab, props))
  return { ...result, onToggleFollow: props.onToggleFollow }
}

describe('LocateMeFab', () => {
  it('renders a disabled button when userLocation is null', () => {
    setup({ userLocation: null })
    const btn = screen.getByTitle('Location unavailable')
    expect(btn).toBeDefined()
  })

  it('renders an active button when following and location is available', () => {
    setup({ userLocation: { lat: 0, lng: 0, accuracy: 5 }, isFollowingUser: true })
    const btn = screen.getByTitle('Following')
    expect(btn).toBeDefined()
  })

  it('renders an inactive button when not following and location is available', () => {
    setup({ userLocation: { lat: 0, lng: 0, accuracy: 5 }, isFollowingUser: false })
    const btn = screen.getByTitle('Locate me')
    expect(btn).toBeDefined()
  })

  it('calls onToggleFollow with toggled value on click', async () => {
    const onToggleFollow = vi.fn()
    setup({
      userLocation: { lat: 0, lng: 0, accuracy: 5 },
      isFollowingUser: false,
      onToggleFollow,
    })
    const btn = screen.getByTitle('Locate me')
    await userEvent.click(btn)
    expect(onToggleFollow).toHaveBeenCalledWith(true)
  })
})

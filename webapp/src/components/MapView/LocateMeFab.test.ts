import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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
  let getCurrentPositionMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    getCurrentPositionMock = vi.fn()
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition: getCurrentPositionMock },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows danger-colored button with allow-location title when no location', () => {
    setup({ userLocation: null })
    const btn = screen.getByTitle('Allow location access')
    expect(btn).toBeDefined()
  })

  it('shows primary-colored button with following title when following', () => {
    setup({ userLocation: { lat: 0, lng: 0, accuracy: 5 }, isFollowingUser: true })
    const btn = screen.getByTitle('Following')
    expect(btn).toBeDefined()
  })

  it('shows medium-colored button with locate-me title when not following', () => {
    setup({ userLocation: { lat: 0, lng: 0, accuracy: 5 }, isFollowingUser: false })
    const btn = screen.getByTitle('Locate me')
    expect(btn).toBeDefined()
  })

  it('calls getCurrentPosition when clicked with no location to trigger permission prompt', async () => {
    setup({ userLocation: null })
    const btn = screen.getByTitle('Allow location access')
    await userEvent.click(btn)
    expect(getCurrentPositionMock).toHaveBeenCalled()
  })

  it('calls onToggleFollow with toggled value when clicked with location available', async () => {
    const onToggleFollow = vi.fn()
    setup({ userLocation: { lat: 0, lng: 0, accuracy: 5 }, isFollowingUser: false, onToggleFollow })
    const btn = screen.getByTitle('Locate me')
    await userEvent.click(btn)
    expect(onToggleFollow).toHaveBeenCalledWith(true)
  })
})

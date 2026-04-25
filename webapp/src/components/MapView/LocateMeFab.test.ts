import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

  it('shows allow-location title when no location', () => {
    setup({ userLocation: null })
    expect(screen.getByTitle('Allow location access')).toBeDefined()
  })

  it('shows following title when following', () => {
    setup({ userLocation: { lat: 0, lng: 0, accuracy: 5 }, isFollowingUser: true })
    expect(screen.getByTitle('Following')).toBeDefined()
  })

  it('shows locate-me title when not following', () => {
    setup({ userLocation: { lat: 0, lng: 0, accuracy: 5 }, isFollowingUser: false })
    expect(screen.getByTitle('Locate me')).toBeDefined()
  })

  it('calls getCurrentPosition when clicked with no location', async () => {
    setup({ userLocation: null })
    await userEvent.click(screen.getByTitle('Allow location access'))
    expect(getCurrentPositionMock).toHaveBeenCalled()
  })

  it('shows settings toast when permission is denied', async () => {
    getCurrentPositionMock.mockImplementation((_success: unknown, error: (e: GeolocationPositionError) => void) => {
      error({ code: 1 } as GeolocationPositionError)
    })
    setup({ userLocation: null })
    await userEvent.click(screen.getByTitle('Allow location access'))
    await waitFor(() => {
      const toast = document.querySelector('ion-toast[is-open="true"]')
      expect(toast?.getAttribute('message')).toMatch(/blocked/i)
    })
  })

  it('always calls onToggleFollow(true) when location is available, regardless of current follow state', async () => {
    const onToggleFollow = vi.fn()
    setup({ userLocation: { lat: 0, lng: 0, accuracy: 5 }, isFollowingUser: false, onToggleFollow })
    await userEvent.click(screen.getByTitle('Locate me'))
    expect(onToggleFollow).toHaveBeenCalledWith(true)
  })

  it('re-centers when already following (does not toggle off)', async () => {
    const onToggleFollow = vi.fn()
    setup({ userLocation: { lat: 0, lng: 0, accuracy: 5 }, isFollowingUser: true, onToggleFollow })
    await userEvent.click(screen.getByTitle('Following'))
    expect(onToggleFollow).toHaveBeenCalledWith(true)
  })
})

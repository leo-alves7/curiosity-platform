import '@/i18n/index'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AppTabs from './AppTabs'
import * as useIsMobileModule from './useIsMobile'

function setup(path = '/map') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppTabs />
    </MemoryRouter>,
  )
}

describe('AppTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  describe('mobile layout', () => {
    beforeEach(() => {
      vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(true)
    })

    it('renders tab bar on mobile', () => {
      const { container } = setup()
      expect(container.querySelector('ion-tab-bar')).not.toBeNull()
    })

    it('renders Map tab button', () => {
      const { container } = setup()
      expect(container.querySelector('ion-tab-button[tab="map"]')).not.toBeNull()
    })

    it('renders Explore tab button', () => {
      const { container } = setup()
      expect(container.querySelector('ion-tab-button[tab="explore"]')).not.toBeNull()
    })

    it('marks the active tab as selected based on current path', () => {
      const { container } = setup('/map')
      const mapBtn = container.querySelector('ion-tab-button[tab="map"]')
      expect(mapBtn?.getAttribute('selected')).toBe('true')
    })

    it('marks explore tab as selected when on /explore path', () => {
      const { container } = setup('/explore')
      const exploreBtn = container.querySelector('ion-tab-button[tab="explore"]')
      expect(exploreBtn?.getAttribute('selected')).toBe('true')
    })

    it('does not render tab bar on non-tab routes', () => {
      const { container } = setup('/stores/abc')
      expect(container.querySelector('ion-tab-bar')).toBeNull()
    })
  })

  describe('desktop layout', () => {
    beforeEach(() => {
      vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(false)
    })

    it('does not render tab bar on desktop', () => {
      const { container } = setup()
      expect(container.querySelector('ion-tab-bar')).toBeNull()
    })
  })
})

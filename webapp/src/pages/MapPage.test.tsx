import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import MapPage from './MapPage'

vi.mock('maplibre-gl', () => ({
  default: {
    Map: vi.fn().mockImplementation(() => ({ remove: vi.fn() })),
  },
}))

describe('MapPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<MapPage />)
    expect(container).toBeDefined()
  })
})

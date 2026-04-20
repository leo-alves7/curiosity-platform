import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '../store'
import MapPage from './MapPage'

vi.mock('maplibre-gl', () => ({
  default: {
    Map: vi.fn().mockImplementation(() => ({
      remove: vi.fn(),
      on: vi.fn(),
      getCenter: vi.fn().mockReturnValue({ lng: -53.45528, lat: -24.95583 }),
      getZoom: vi.fn().mockReturnValue(12),
    })),
    Marker: vi.fn().mockImplementation(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      setPopup: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn(),
    })),
    Popup: vi.fn().mockImplementation(() => ({
      setDOMContent: vi.fn().mockReturnThis(),
    })),
  },
}))

vi.mock('../components/MapView/useMapMarkers', () => ({
  useMapMarkers: vi.fn(),
}))

describe('MapPage', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Provider store={store}>
        <MapPage />
      </Provider>,
    )
    expect(container).toBeDefined()
  })
})

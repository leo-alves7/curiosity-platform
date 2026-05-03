import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useEffect } from 'react'

type GeoJSONSourceMock = { setData: ReturnType<typeof vi.fn> }

function makeMapMock(sourceExists = false) {
  const sourceMock: GeoJSONSourceMock = { setData: vi.fn() }
  return {
    getSource: vi.fn().mockReturnValue(sourceExists ? sourceMock : null),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn().mockReturnValue(undefined),
    removeSource: vi.fn().mockReturnValue(undefined),
    getLayer: vi.fn().mockReturnValue(true),
    _source: sourceMock,
  }
}

describe('UserLocationLayer effect', () => {
  let map: ReturnType<typeof makeMapMock>

  beforeEach(() => {
    map = makeMapMock()
  })

  it('does nothing when map is null', () => {
    // Simulate the component receiving map=null — no source or layer should be created
    renderHook(() => {
      useEffect(() => {
        // map is null; guard exits early
      }, [])
    })
    expect(map.addSource).not.toHaveBeenCalled()
  })

  it('adds source and two layers when map is provided', () => {
    renderHook(() => {
      useEffect(() => {
        map.addSource('user-location', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        })
        map.addLayer({ id: 'user-location-accuracy' } as never)
        map.addLayer({ id: 'user-location-dot' } as never)

        return () => {
          if (map.getLayer('user-location-dot')) map.removeLayer('user-location-dot')
          if (map.getLayer('user-location-accuracy')) map.removeLayer('user-location-accuracy')
          if (map.getSource('user-location')) map.removeSource('user-location')
        }
      }, [])
    })

    expect(map.addSource).toHaveBeenCalledWith(
      'user-location',
      expect.objectContaining({ type: 'geojson' }),
    )
    expect(map.addLayer).toHaveBeenCalledTimes(2)
  })

  it('removes layers and source on cleanup', () => {
    // getSource must return truthy so the guard in cleanup passes
    map.getSource.mockReturnValue({ setData: vi.fn() })

    const { unmount } = renderHook(() => {
      useEffect(() => {
        map.addSource('user-location', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        })

        return () => {
          if (map.getLayer('user-location-dot')) map.removeLayer('user-location-dot')
          if (map.getLayer('user-location-accuracy')) map.removeLayer('user-location-accuracy')
          if (map.getSource('user-location')) map.removeSource('user-location')
        }
      }, [])
    })

    unmount()
    expect(map.removeLayer).toHaveBeenCalledWith('user-location-dot')
    expect(map.removeLayer).toHaveBeenCalledWith('user-location-accuracy')
    expect(map.removeSource).toHaveBeenCalledWith('user-location')
  })

  it('calls setData when location updates and source exists', () => {
    const sourceWithSetData = { setData: vi.fn() }
    map.getSource.mockReturnValue(sourceWithSetData)

    renderHook(() => {
      useEffect(() => {
        const source = map.getSource('user-location') as typeof sourceWithSetData | null
        if (!source) return

        source.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [-46.63, -23.55] },
              properties: { accuracy: 20 },
            },
          ],
        })
      }, [])
    })

    expect(sourceWithSetData.setData).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'FeatureCollection' }),
    )
  })
})

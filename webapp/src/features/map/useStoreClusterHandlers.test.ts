import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useStoreClusterHandlers } from './useStoreClusterHandlers'
import type { StoreResponse } from '@/types/store'
import { CLUSTERS_LAYER_ID, UNCLUSTERED_LAYER_ID } from './storeClusterLayers'

vi.mock('./createStorePopup', () => ({
  createStorePopup: vi.fn().mockReturnValue({
    setLngLat: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
  }),
}))

function makeStore(overrides: Partial<StoreResponse> = {}): StoreResponse {
  return {
    id: 'store-1',
    name: 'Test Store',
    description: null,
    address: '123 Main St',
    lat: -24.95,
    lng: -53.45,
    category_id: 'cat-1',
    image_url: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeMapMock() {
  const listeners: Record<string, ((...args: unknown[]) => void)[]> = {}

  return {
    on: vi.fn((event: string, layerOrHandler: unknown, handler?: unknown) => {
      const key = handler ? `${event}:${layerOrHandler}` : event
      const fn = (handler ?? layerOrHandler) as (...args: unknown[]) => void
      listeners[key] = listeners[key] ?? []
      listeners[key].push(fn)
    }),
    off: vi.fn(),
    queryRenderedFeatures: vi.fn(),
    getSource: vi.fn(),
    getCanvas: vi.fn().mockReturnValue({ style: { cursor: '' } }),
    easeTo: vi.fn(),
    emit: (event: string, layer: string, ...args: unknown[]) => {
      const key = `${event}:${layer}`
      for (const fn of listeners[key] ?? []) fn(...args)
    },
  }
}

describe('useStoreClusterHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does nothing when map is null', () => {
    const { unmount } = renderHook(() => useStoreClusterHandlers(null, [], {}, vi.fn()))
    expect(() => unmount()).not.toThrow()
  })

  it('registers click and cursor listeners on mount', () => {
    const map = makeMapMock()
    renderHook(() => useStoreClusterHandlers(map as never, [makeStore()], {}, vi.fn()))
    expect(map.on).toHaveBeenCalledWith('click', CLUSTERS_LAYER_ID, expect.any(Function))
    expect(map.on).toHaveBeenCalledWith('click', UNCLUSTERED_LAYER_ID, expect.any(Function))
    expect(map.on).toHaveBeenCalledWith('mouseenter', CLUSTERS_LAYER_ID, expect.any(Function))
    expect(map.on).toHaveBeenCalledWith('mouseleave', CLUSTERS_LAYER_ID, expect.any(Function))
  })

  it('removes all listeners on unmount', () => {
    const map = makeMapMock()
    const { unmount } = renderHook(() =>
      useStoreClusterHandlers(map as never, [makeStore()], {}, vi.fn()),
    )
    unmount()
    expect(map.off).toHaveBeenCalledWith('click', CLUSTERS_LAYER_ID, expect.any(Function))
    expect(map.off).toHaveBeenCalledWith('click', UNCLUSTERED_LAYER_ID, expect.any(Function))
  })

  it('triggers cluster expansion zoom on cluster click', async () => {
    const map = makeMapMock()
    const getClusterExpansionZoom = vi.fn().mockResolvedValue(10)
    map.getSource.mockReturnValue({ getClusterExpansionZoom })
    map.queryRenderedFeatures.mockReturnValue([
      {
        properties: { cluster_id: 42, point_count: 5 },
        geometry: { type: 'Point', coordinates: [-53.45, -24.95] },
      },
    ])

    renderHook(() => useStoreClusterHandlers(map as never, [], {}, vi.fn()))

    map.emit('click', CLUSTERS_LAYER_ID, { point: { x: 0, y: 0 } })
    await Promise.resolve()

    expect(map.easeTo).toHaveBeenCalledWith(
      expect.objectContaining({ zoom: 10, center: [-53.45, -24.95] }),
    )
  })

  it('does not easeTo if cluster expansion zoom rejects', async () => {
    const map = makeMapMock()
    const getClusterExpansionZoom = vi.fn().mockRejectedValue(new Error('fail'))
    map.getSource.mockReturnValue({ getClusterExpansionZoom })
    map.queryRenderedFeatures.mockReturnValue([
      {
        properties: { cluster_id: 99, point_count: 3 },
        geometry: { type: 'Point', coordinates: [-53.45, -24.95] },
      },
    ])

    renderHook(() => useStoreClusterHandlers(map as never, [], {}, vi.fn()))

    map.emit('click', CLUSTERS_LAYER_ID, { point: { x: 0, y: 0 } })
    await Promise.resolve()

    expect(map.easeTo).not.toHaveBeenCalled()
  })

  it('shows popup on unclustered point click without immediate navigation', () => {
    const map = makeMapMock()
    const onMarkerClick = vi.fn()
    const store = makeStore({ id: 'store-abc' })
    map.queryRenderedFeatures.mockReturnValue([
      {
        properties: { id: 'store-abc' },
        geometry: { type: 'Point', coordinates: [-53.45, -24.95] },
      },
    ])

    renderHook(() => useStoreClusterHandlers(map as never, [store], {}, onMarkerClick))

    map.emit('click', UNCLUSTERED_LAYER_ID, { point: { x: 0, y: 0 } })

    expect(onMarkerClick).not.toHaveBeenCalled()
  })

  it('does not call onMarkerClick when feature has no storeId', () => {
    const map = makeMapMock()
    const onMarkerClick = vi.fn()
    map.queryRenderedFeatures.mockReturnValue([
      { properties: {}, geometry: { type: 'Point', coordinates: [-53.45, -24.95] } },
    ])

    renderHook(() => useStoreClusterHandlers(map as never, [], {}, onMarkerClick))

    map.emit('click', UNCLUSTERED_LAYER_ID, { point: { x: 0, y: 0 } })

    expect(onMarkerClick).not.toHaveBeenCalled()
  })

  it('does not call onMarkerClick when store has null coordinates', () => {
    const map = makeMapMock()
    const onMarkerClick = vi.fn()
    const store = makeStore({ id: 'store-nullcoords', lat: null, lng: null })
    map.queryRenderedFeatures.mockReturnValue([
      { properties: { id: 'store-nullcoords' }, geometry: { type: 'Point', coordinates: [0, 0] } },
    ])

    renderHook(() => useStoreClusterHandlers(map as never, [store], {}, onMarkerClick))

    map.emit('click', UNCLUSTERED_LAYER_ID, { point: { x: 0, y: 0 } })

    expect(onMarkerClick).not.toHaveBeenCalled()
  })
})

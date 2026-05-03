import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import maplibregl from 'maplibre-gl'
import { usePinDrop } from './usePinDrop'

vi.mock('maplibre-gl', () => {
  const Marker = vi.fn()
  return {
    default: { Marker },
    Marker,
  }
})

interface MockMap {
  on: ReturnType<typeof vi.fn>
  off: ReturnType<typeof vi.fn>
  getCanvas: () => { style: { cursor: string } }
  _handlers: Record<string, ((e: unknown) => void) | undefined>
}

function makeMap(): MockMap {
  const handlers: Record<string, ((e: unknown) => void) | undefined> = {}
  return {
    on: vi.fn((event: string, handler: (e: unknown) => void) => {
      handlers[event] = handler
    }),
    off: vi.fn((event: string) => {
      delete handlers[event]
    }),
    getCanvas: () => ({ style: { cursor: '' } }),
    _handlers: handlers,
  }
}

function makeMarker() {
  const dragHandlers: Record<string, () => void> = {}
  const marker = {
    setLngLat: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    on: vi.fn((event: string, handler: () => void) => {
      dragHandlers[event] = handler
    }),
    getLngLat: vi.fn().mockReturnValue({ lat: 10, lng: 20 }),
    _dragHandlers: dragHandlers,
  }
  return marker
}

describe('usePinDrop', () => {
  let map: MockMap
  let marker: ReturnType<typeof makeMarker>

  beforeEach(() => {
    map = makeMap()
    marker = makeMarker()
    vi.mocked(maplibregl.Marker).mockReset()
    vi.mocked(maplibregl.Marker).mockImplementation(() => marker as unknown as maplibregl.Marker)
  })

  it('does not attach a click listener when isActive is false', () => {
    const onPinDropped = vi.fn()
    renderHook(() => usePinDrop(map as unknown as maplibregl.Map, false, onPinDropped))
    expect(map.on).not.toHaveBeenCalled()
  })

  it('does nothing when map is null', () => {
    const onPinDropped = vi.fn()
    renderHook(() => usePinDrop(null, true, onPinDropped))
    expect(onPinDropped).not.toHaveBeenCalled()
  })

  it('attaches a click listener when active', () => {
    const onPinDropped = vi.fn()
    renderHook(() => usePinDrop(map as unknown as maplibregl.Map, true, onPinDropped))
    expect(map.on).toHaveBeenCalledWith('click', expect.any(Function))
  })

  it('creates a marker and calls onPinDropped on click', () => {
    const onPinDropped = vi.fn()
    renderHook(() => usePinDrop(map as unknown as maplibregl.Map, true, onPinDropped))
    map._handlers['click']?.({ lngLat: { lng: -46.63, lat: -23.55 } })
    expect(marker.setLngLat).toHaveBeenCalledWith([-46.63, -23.55])
    expect(marker.addTo).toHaveBeenCalled()
    expect(onPinDropped).toHaveBeenCalledWith(-23.55, -46.63)
  })

  it('repositions the existing marker on subsequent clicks', () => {
    const onPinDropped = vi.fn()
    renderHook(() => usePinDrop(map as unknown as maplibregl.Map, true, onPinDropped))
    map._handlers['click']?.({ lngLat: { lng: 1, lat: 2 } })
    map._handlers['click']?.({ lngLat: { lng: 3, lat: 4 } })
    expect(vi.mocked(maplibregl.Marker)).toHaveBeenCalledTimes(1)
    expect(marker.setLngLat).toHaveBeenLastCalledWith([3, 4])
  })

  it('calls onPinDropped on dragend with the new marker location', () => {
    const onPinDropped = vi.fn()
    renderHook(() => usePinDrop(map as unknown as maplibregl.Map, true, onPinDropped))
    map._handlers['click']?.({ lngLat: { lng: 1, lat: 2 } })
    onPinDropped.mockClear()
    marker._dragHandlers['dragend']?.()
    expect(onPinDropped).toHaveBeenCalledWith(10, 20)
  })

  it('cleans up listener and marker on unmount', () => {
    const onPinDropped = vi.fn()
    const { unmount } = renderHook(() =>
      usePinDrop(map as unknown as maplibregl.Map, true, onPinDropped),
    )
    map._handlers['click']?.({ lngLat: { lng: 1, lat: 2 } })
    unmount()
    expect(map.off).toHaveBeenCalledWith('click', expect.any(Function))
    expect(marker.remove).toHaveBeenCalled()
  })

  it('removes listener when isActive flips to false', () => {
    const onPinDropped = vi.fn()
    const { rerender } = renderHook(
      ({ active }: { active: boolean }) =>
        usePinDrop(map as unknown as maplibregl.Map, active, onPinDropped),
      { initialProps: { active: true } },
    )
    rerender({ active: false })
    expect(map.off).toHaveBeenCalledWith('click', expect.any(Function))
  })
})

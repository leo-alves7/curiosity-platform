import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMapImageLoader } from './useMapImageLoader'
import type { CategoryResponse } from '@/types/category'

const makeCategory = (slug: string): CategoryResponse => ({
  id: `id-${slug}`,
  name: slug,
  slug,
  icon: null,
  color: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
})

const makeMap = (overrides: Record<string, unknown> = {}) => ({
  hasImage: vi.fn(() => false),
  addImage: vi.fn(),
  isStyleLoaded: vi.fn(() => true),
  once: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  ...overrides,
})

describe('useMapImageLoader', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'Image',
      class {
        onload: (() => void) | null = null
        private _src = ''
        get src() {
          return this._src
        }
        set src(url: string) {
          this._src = url
          this.onload?.()
        }
      },
    )
  })

  it('does nothing when map is null', () => {
    expect(() => renderHook(() => useMapImageLoader(null, []))).not.toThrow()
  })

  it('does nothing when categories is empty', () => {
    const map = makeMap()
    renderHook(() => useMapImageLoader(map as never, []))
    expect(map.addImage).not.toHaveBeenCalled()
  })

  it('calls addImage for each category when style is loaded', () => {
    const map = makeMap()
    const categories = [makeCategory('restaurant'), makeCategory('pharmacy')]
    renderHook(() => useMapImageLoader(map as never, categories))
    expect(map.addImage).toHaveBeenCalledWith('category:restaurant', expect.any(Object))
    expect(map.addImage).toHaveBeenCalledWith('category:pharmacy', expect.any(Object))
    expect(map.addImage).toHaveBeenCalledWith('category:default', expect.any(Object))
  })

  it('registers styledata listener', () => {
    const map = makeMap()
    renderHook(() => useMapImageLoader(map as never, [makeCategory('restaurant')]))
    expect(map.on).toHaveBeenCalledWith('styledata', expect.any(Function))
  })

  it('deregisters styledata listener on unmount', () => {
    const map = makeMap()
    const { unmount } = renderHook(() =>
      useMapImageLoader(map as never, [makeCategory('restaurant')]),
    )
    unmount()
    expect(map.off).toHaveBeenCalledWith('styledata', expect.any(Function))
  })

  it('skips addImage when image already registered', () => {
    const map = makeMap({ hasImage: vi.fn(() => true) })
    renderHook(() => useMapImageLoader(map as never, [makeCategory('restaurant')]))
    expect(map.addImage).not.toHaveBeenCalled()
  })

  it('uses map.once("load") when style is not loaded', () => {
    const map = makeMap({ isStyleLoaded: vi.fn(() => false) })
    renderHook(() => useMapImageLoader(map as never, [makeCategory('restaurant')]))
    expect(map.once).toHaveBeenCalledWith('load', expect.any(Function))
  })
})

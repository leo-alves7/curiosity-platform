import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSearchDebounce } from './useSearchDebounce'

describe('useSearchDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls callback after the delay elapses', () => {
    const callback = vi.fn()
    renderHook(() => useSearchDebounce('hello', 300, callback))

    expect(callback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(callback).toHaveBeenCalledWith('hello')
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('does not call callback before delay elapses', () => {
    const callback = vi.fn()
    renderHook(() => useSearchDebounce('hello', 300, callback))

    act(() => {
      vi.advanceTimersByTime(299)
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('cancels previous timer when value changes', () => {
    const callback = vi.fn()
    const { rerender } = renderHook(({ value }) => useSearchDebounce(value, 300, callback), {
      initialProps: { value: 'a' },
    })

    act(() => {
      vi.advanceTimersByTime(150)
    })

    rerender({ value: 'ab' })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(callback).toHaveBeenCalledWith('ab')
    expect(callback).not.toHaveBeenCalledWith('a')
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('calls the latest callback reference when it changes between renders', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()
    const { rerender } = renderHook(
      ({ cb }) => useSearchDebounce('hello', 300, cb),
      { initialProps: { cb: callback1 } },
    )

    rerender({ cb: callback2 })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(callback2).toHaveBeenCalledWith('hello')
    expect(callback1).not.toHaveBeenCalled()
  })

  it('cancels pending timer on unmount', () => {
    const callback = vi.fn()
    const { unmount } = renderHook(() => useSearchDebounce('hello', 300, callback))

    unmount()

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(callback).not.toHaveBeenCalled()
  })
})

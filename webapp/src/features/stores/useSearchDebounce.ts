import { useEffect, useRef } from 'react'

export function useSearchDebounce(
  value: string,
  delay: number,
  callback: (val: string) => void,
): void {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      callbackRef.current(value)
    }, delay)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [value, delay])
}

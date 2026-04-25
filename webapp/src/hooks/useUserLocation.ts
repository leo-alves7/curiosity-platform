import { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setUserLocation } from '@/slices/locationSlice'
import type { AppDispatch } from '@/store'

export function useUserLocation() {
  const dispatch = useDispatch<AppDispatch>()

  const onSuccess = useCallback(
    (position: GeolocationPosition) => {
      dispatch(
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      )
    },
    [dispatch],
  )

  const onError = useCallback((error: GeolocationPositionError) => {
    console.error('Geolocation error', error.code)
  }, [])

  useEffect(() => {
    const geo = navigator.geolocation
    if (!geo) return

    const watchId = geo.watchPosition(onSuccess, onError, { enableHighAccuracy: true })

    // Capture geo in closure so cleanup works even after globals are restored in tests
    return () => {
      geo.clearWatch(watchId)
    }
  }, [onSuccess, onError])
}

import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectTheme, type ThemePreference } from '@/slices/settingsSlice'

export function resolveEffectiveTheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference === 'dark') return 'dark'
  if (preference === 'light') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme(): 'light' | 'dark' {
  const preference = useSelector(selectTheme)
  const effective = resolveEffectiveTheme(preference)

  useEffect(() => {
    const html = document.documentElement

    const apply = (isDark: boolean) => {
      if (isDark) {
        html.classList.add('ion-palette-dark')
      } else {
        html.classList.remove('ion-palette-dark')
      }
    }

    apply(effective === 'dark')

    if (preference !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => apply(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [preference, effective])

  return effective
}

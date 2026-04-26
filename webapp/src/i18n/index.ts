import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import enJson from '../locales/en.json'
import ptBRJson from '../locales/pt-BR.json'

const SETTINGS_LANGUAGE_KEY = 'settings.language'

function getStoredLanguage(): 'en' | 'pt-BR' | undefined {
  try {
    const stored = localStorage.getItem(SETTINGS_LANGUAGE_KEY)
    if (stored === 'en' || stored === 'pt-BR') return stored
    return undefined
  } catch {
    return undefined
  }
}

i18next.use(initReactI18next).init({
  resources: {
    en: { translation: enJson },
    'pt-BR': { translation: ptBRJson },
  },
  lng: getStoredLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
})

export default i18next

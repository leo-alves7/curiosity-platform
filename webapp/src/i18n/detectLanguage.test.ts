import { describe, it, expect, afterEach, vi } from 'vitest'
import { detectLanguage } from './detectLanguage'

function mockNavigatorLanguage(lang: string) {
  vi.stubGlobal('navigator', { ...navigator, language: lang })
}

function mockIntlTimeZone(tz: string) {
  vi.spyOn(globalThis.Intl, 'DateTimeFormat').mockReturnValue({
    resolvedOptions: () => ({
      timeZone: tz,
      locale: 'en',
      calendar: 'gregory',
      numberingSystem: 'latn',
    }),
    format: () => '',
    formatToParts: () => [],
    formatRange: () => '',
    formatRangeToParts: () => [],
  } as unknown as Intl.DateTimeFormat)
}

describe('detectLanguage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('returns pt-BR when navigator.language starts with "pt"', () => {
    mockNavigatorLanguage('pt')
    mockIntlTimeZone('America/New_York')
    expect(detectLanguage()).toBe('pt-BR')
  })

  it('returns pt-BR when navigator.language is "pt-BR"', () => {
    mockNavigatorLanguage('pt-BR')
    mockIntlTimeZone('America/New_York')
    expect(detectLanguage()).toBe('pt-BR')
  })

  it('returns pt-BR when navigator.language is "pt-PT"', () => {
    mockNavigatorLanguage('pt-PT')
    mockIntlTimeZone('Europe/Lisbon')
    expect(detectLanguage()).toBe('pt-BR')
  })

  it('returns pt-BR when timezone is America/Sao_Paulo', () => {
    mockNavigatorLanguage('en-US')
    mockIntlTimeZone('America/Sao_Paulo')
    expect(detectLanguage()).toBe('pt-BR')
  })

  it('returns pt-BR when timezone is America/Fortaleza', () => {
    mockNavigatorLanguage('en-US')
    mockIntlTimeZone('America/Fortaleza')
    expect(detectLanguage()).toBe('pt-BR')
  })

  it('returns pt-BR when timezone is America/Manaus', () => {
    mockNavigatorLanguage('en-US')
    mockIntlTimeZone('America/Manaus')
    expect(detectLanguage()).toBe('pt-BR')
  })

  it('returns en when language is "en-US" and timezone is America/New_York', () => {
    mockNavigatorLanguage('en-US')
    mockIntlTimeZone('America/New_York')
    expect(detectLanguage()).toBe('en')
  })

  it('returns en when language is "es" and timezone is America/Bogota', () => {
    mockNavigatorLanguage('es')
    mockIntlTimeZone('America/Bogota')
    expect(detectLanguage()).toBe('en')
  })

  it('returns en when language is empty and timezone is Europe/London', () => {
    mockNavigatorLanguage('')
    mockIntlTimeZone('Europe/London')
    expect(detectLanguage()).toBe('en')
  })
})

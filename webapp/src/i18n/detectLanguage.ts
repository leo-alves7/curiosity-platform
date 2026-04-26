const BRAZIL_TIMEZONES = new Set([
  'America/Sao_Paulo',
  'America/Fortaleza',
  'America/Recife',
  'America/Belem',
  'America/Manaus',
  'America/Porto_Velho',
  'America/Boa_Vista',
  'America/Campo_Grande',
  'America/Cuiaba',
  'America/Santarem',
  'America/Porto_Acre',
  'America/Rio_Branco',
  'America/Araguaina',
  'America/Maceio',
  'America/Bahia',
  'America/Noronha',
])

export function detectLanguage(): 'en' | 'pt-BR' {
  const lang = navigator.language ?? ''
  if (lang.toLowerCase().startsWith('pt')) return 'pt-BR'
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''
  if (BRAZIL_TIMEZONES.has(tz)) return 'pt-BR'
  return 'en'
}

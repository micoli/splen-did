import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { TRANSLATIONS } from './translations'
import type { Lang } from './translations'

const STORAGE_KEY = 'splen-did-lang'

function readStoredLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'en' ? 'en' : 'fr'
}

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
  t: (typeof TRANSLATIONS)['fr']
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readStoredLang)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
  }, [lang])

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'fr' ? 'en' : 'fr'))
  }, [])

  const value: LanguageContextValue = { lang, setLang, toggleLang, t: TRANSLATIONS[lang] }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}

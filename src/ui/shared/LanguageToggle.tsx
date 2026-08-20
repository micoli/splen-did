import { useLanguage } from '../../i18n/LanguageContext'

export function LanguageToggle() {
  const { lang, toggleLang, t } = useLanguage()

  return (
    <button type="button" className="lang-toggle" onClick={toggleLang} aria-label={t.language}>
      {lang === 'fr' ? 'FR' : 'EN'}
    </button>
  )
}

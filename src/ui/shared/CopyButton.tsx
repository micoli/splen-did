import { useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'

interface CopyButtonProps {
  text: string
}

export function CopyButton({ text }: CopyButtonProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button type="button" onClick={handleCopy} disabled={!text}>
      {copied ? t.copied : t.copy}
    </button>
  )
}

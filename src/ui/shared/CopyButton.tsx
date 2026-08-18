import { useState } from 'react'

interface CopyButtonProps {
  text: string
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button type="button" onClick={handleCopy} disabled={!text}>
      {copied ? 'Copie !' : 'Copier'}
    </button>
  )
}

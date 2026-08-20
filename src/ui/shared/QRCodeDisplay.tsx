import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { useLanguage } from '../../i18n/LanguageContext'

interface QRCodeDisplayProps {
  value: string
}

export function QRCodeDisplay({ value }: QRCodeDisplayProps) {
  const { t } = useLanguage()
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [tooLong, setTooLong] = useState(false)

  useEffect(() => {
    if (!value) {
      setDataUrl(null)
      return
    }
    let cancelled = false
    QRCode.toDataURL(value, { errorCorrectionLevel: 'L', margin: 1 })
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url)
          setTooLong(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDataUrl(null)
          setTooLong(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [value])

  if (tooLong) return <p>{t.qrTooLong}</p>
  if (!dataUrl) return null

  return <img src={dataUrl} alt="QR code" width={220} height={220} />
}

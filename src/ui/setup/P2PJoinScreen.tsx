import { useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { createAnswerFromOffer, onChannelOpen } from '../../net/webrtc'
import type { PeerHandle } from '../../net/webrtc'
import { CopyButton } from '../shared/CopyButton'
import { QRCodeDisplay } from '../shared/QRCodeDisplay'
import { QRCodeScanner } from '../shared/QRCodeScanner'

interface P2PJoinScreenProps {
  onConnected: (handle: PeerHandle) => void
}

type Step = 'idle' | 'answer-ready'

export function P2PJoinScreen({ onConnected }: P2PJoinScreenProps) {
  const { t } = useLanguage()
  const [step, setStep] = useState<Step>('idle')
  const [offerInput, setOfferInput] = useState('')
  const [answerBlob, setAnswerBlob] = useState('')
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleJoin() {
    setError(null)
    try {
      const { handle, answerBlob: blob } = await createAnswerFromOffer(offerInput)
      setAnswerBlob(blob)
      setStep('answer-ready')
      onChannelOpen(handle, () => onConnected(handle))
    } catch {
      setError(t.joinInvalidCode)
    }
  }

  return (
    <div className="panel">
      <h3>{t.joinTitle}</h3>
      {step === 'idle' && (
        <>
          <p>{t.joinStep1}</p>
          {scanning ? (
            <QRCodeScanner
              onScan={(text) => {
                setOfferInput(text)
                setScanning(false)
              }}
              onCancel={() => setScanning(false)}
            />
          ) : (
            <>
              <textarea
                value={offerInput}
                onChange={(e) => setOfferInput(e.target.value)}
                rows={4}
                style={{ width: '100%' }}
                placeholder={t.joinOfferPlaceholder}
              />
              <button type="button" onClick={() => setScanning(true)}>
                {t.scanQRCode}
              </button>
            </>
          )}
          <button type="button" className="btn-primary" onClick={handleJoin} disabled={!offerInput.trim()}>
            {t.joinAction}
          </button>
        </>
      )}

      {step === 'answer-ready' && (
        <>
          <p>{t.joinStep2}</p>
          <textarea readOnly value={answerBlob} rows={4} style={{ width: '100%' }} onClick={(e) => e.currentTarget.select()} />
          <CopyButton text={answerBlob} />
          <QRCodeDisplay value={answerBlob} />
          <p>{t.joinWaiting}</p>
        </>
      )}

      {error && <p style={{ color: 'var(--gem-red)' }}>{error}</p>}
    </div>
  )
}

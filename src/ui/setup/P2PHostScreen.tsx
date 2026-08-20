import { useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { acceptAnswer, createOffer, onChannelOpen } from '../../net/webrtc'
import type { PeerHandle } from '../../net/webrtc'
import { CopyButton } from '../shared/CopyButton'
import { QRCodeDisplay } from '../shared/QRCodeDisplay'
import { QRCodeScanner } from '../shared/QRCodeScanner'

interface P2PHostScreenProps {
  onConnected: (handle: PeerHandle) => void
}

type Step = 'idle' | 'offer-ready' | 'connecting'

export function P2PHostScreen({ onConnected }: P2PHostScreenProps) {
  const { t } = useLanguage()
  const [step, setStep] = useState<Step>('idle')
  const [handle, setHandle] = useState<PeerHandle | null>(null)
  const [offerBlob, setOfferBlob] = useState('')
  const [answerInput, setAnswerInput] = useState('')
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreateOffer() {
    setError(null)
    const result = await createOffer()
    setHandle(result.handle)
    setOfferBlob(result.offerBlob)
    setStep('offer-ready')
  }

  async function handleConnect() {
    if (!handle) return
    setError(null)
    try {
      await acceptAnswer(handle, answerInput)
      setStep('connecting')
      onChannelOpen(handle, () => onConnected(handle))
    } catch {
      setError(t.hostInvalidAnswer)
    }
  }

  return (
    <div className="panel">
      <h3>{t.hostTitle}</h3>
      {step === 'idle' && (
        <button type="button" className="btn-primary" onClick={handleCreateOffer}>
          {t.hostCreate}
        </button>
      )}

      {step !== 'idle' && (
        <>
          <p>1. {t.hostStep1}</p>
          <textarea readOnly value={offerBlob} rows={4} style={{ width: '100%' }} onClick={(e) => e.currentTarget.select()} />
          <CopyButton text={offerBlob} />
          <QRCodeDisplay value={offerBlob} />

          <p>2. {t.hostStep2}</p>
          {scanning ? (
            <QRCodeScanner
              onScan={(text) => {
                setAnswerInput(text)
                setScanning(false)
              }}
              onCancel={() => setScanning(false)}
            />
          ) : (
            <>
              <textarea
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                rows={4}
                style={{ width: '100%' }}
                placeholder={t.hostAnswerPlaceholder}
              />
              <button type="button" onClick={() => setScanning(true)}>
                {t.scanQRCode}
              </button>
            </>
          )}
          <button type="button" className="btn-primary" onClick={handleConnect} disabled={!answerInput.trim() || step === 'connecting'}>
            {step === 'connecting' ? t.hostConnecting : t.hostConnect}
          </button>
        </>
      )}

      {error && <p style={{ color: 'var(--gem-red)' }}>{error}</p>}
    </div>
  )
}

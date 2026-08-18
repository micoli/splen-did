import { useState } from 'react'
import { createAnswerFromOffer, onChannelOpen } from '../../net/webrtc'
import type { PeerHandle } from '../../net/webrtc'

interface P2PJoinScreenProps {
  onConnected: (handle: PeerHandle) => void
}

type Step = 'idle' | 'answer-ready'

export function P2PJoinScreen({ onConnected }: P2PJoinScreenProps) {
  const [step, setStep] = useState<Step>('idle')
  const [offerInput, setOfferInput] = useState('')
  const [answerBlob, setAnswerBlob] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleJoin() {
    setError(null)
    try {
      const { handle, answerBlob: blob } = await createAnswerFromOffer(offerInput)
      setAnswerBlob(blob)
      setStep('answer-ready')
      onChannelOpen(handle, () => onConnected(handle))
    } catch {
      setError('Code invalide, verifiez le texte colle.')
    }
  }

  return (
    <div className="panel">
      <h3>Rejoindre une partie</h3>
      {step === 'idle' && (
        <>
          <p>Collez ici le code recu de l'hote :</p>
          <textarea
            value={offerInput}
            onChange={(e) => setOfferInput(e.target.value)}
            rows={4}
            style={{ width: '100%' }}
            placeholder="Code de l'hote"
          />
          <button type="button" onClick={handleJoin} disabled={!offerInput.trim()}>
            Rejoindre
          </button>
        </>
      )}

      {step === 'answer-ready' && (
        <>
          <p>Renvoyez ce code a l'hote pour finaliser la connexion :</p>
          <textarea readOnly value={answerBlob} rows={4} style={{ width: '100%' }} onClick={(e) => e.currentTarget.select()} />
          <p>En attente de connexion...</p>
        </>
      )}

      {error && <p style={{ color: 'var(--gem-red)' }}>{error}</p>}
    </div>
  )
}

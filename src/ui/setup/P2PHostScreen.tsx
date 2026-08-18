import { useState } from 'react'
import { acceptAnswer, createOffer, onChannelOpen } from '../../net/webrtc'
import type { PeerHandle } from '../../net/webrtc'

interface P2PHostScreenProps {
  onConnected: (handle: PeerHandle) => void
}

type Step = 'idle' | 'offer-ready' | 'connecting'

export function P2PHostScreen({ onConnected }: P2PHostScreenProps) {
  const [step, setStep] = useState<Step>('idle')
  const [handle, setHandle] = useState<PeerHandle | null>(null)
  const [offerBlob, setOfferBlob] = useState('')
  const [answerInput, setAnswerInput] = useState('')
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
      setError('Reponse invalide, verifiez le texte colle.')
    }
  }

  return (
    <div className="panel">
      <h3>Heberger une partie</h3>
      {step === 'idle' && (
        <button type="button" onClick={handleCreateOffer}>
          Creer la partie
        </button>
      )}

      {step !== 'idle' && (
        <>
          <p>1. Envoyez ce code a votre adversaire :</p>
          <textarea readOnly value={offerBlob} rows={4} style={{ width: '100%' }} onClick={(e) => e.currentTarget.select()} />
          <p>2. Collez ici le code de reponse qu'il vous envoie :</p>
          <textarea
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            rows={4}
            style={{ width: '100%' }}
            placeholder="Code de reponse"
          />
          <button type="button" onClick={handleConnect} disabled={!answerInput.trim() || step === 'connecting'}>
            {step === 'connecting' ? 'Connexion en cours...' : 'Connecter'}
          </button>
        </>
      )}

      {error && <p style={{ color: 'var(--gem-red)' }}>{error}</p>}
    </div>
  )
}

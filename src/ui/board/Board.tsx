import { useEffect, useState } from 'react'
import { totalTokens } from '../../engine/selectors'
import type { Action, CardLevel, GameState, Token, TokenColor } from '../../engine/types'
import { ActionBar } from './ActionBar'
import type { InteractionMode } from './ActionBar'
import { CardGrid } from './CardGrid'
import { DiscardModal } from './DiscardModal'
import { GameOverScreen } from './GameOverScreen'
import { NobleClaimBanner } from './NobleClaimBanner'
import { NobleRow } from './NobleRow'
import { PlayerPanel } from './PlayerPanel'
import { RestartPromptModal } from './RestartPromptModal'
import { TokenBank } from './TokenBank'
import './board.css'

interface BoardProps {
  state: GameState
  legalActions: Action[]
  currentPlayerId: string
  lastError: string | null
  dispatch: (action: Action) => void
  onRematch: () => void
  onExit: () => void
  localPlayerId?: string
  onProposeRestart: () => void
  restartAwaiting?: boolean
  restartPrompt?: string
  onRespondRestart?: (accept: boolean) => void
}

export function Board({
  state,
  legalActions,
  currentPlayerId,
  lastError,
  dispatch,
  onRematch,
  onExit,
  localPlayerId,
  onProposeRestart,
  restartAwaiting,
  restartPrompt,
  onRespondRestart,
}: BoardProps) {
  const [mode, setMode] = useState<InteractionMode>('idle')
  const [selectedColors, setSelectedColors] = useState<TokenColor[]>([])
  const [showYourTurnToast, setShowYourTurnToast] = useState(false)

  useEffect(() => {
    setMode('idle')
    setSelectedColors([])
  }, [currentPlayerId, state.turnPhase])

  const currentPlayer = state.players.find((p) => p.id === currentPlayerId)
  const isMyTurn = localPlayerId ? currentPlayerId === localPlayerId : !currentPlayer?.isAI

  useEffect(() => {
    if (!isMyTurn) return
    setShowYourTurnToast(true)
    const timer = setTimeout(() => setShowYourTurnToast(false), 2500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayerId])

  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (!lastError) return
    setShowError(true)
    const timer = setTimeout(() => setShowError(false), 5000)
    return () => clearTimeout(timer)
  }, [lastError])

  const take3Actions = legalActions.filter(
    (a): a is Extract<Action, { type: 'TAKE_THREE_DIFFERENT' }> => a.type === 'TAKE_THREE_DIFFERENT'
  )
  const take2Actions = legalActions.filter((a): a is Extract<Action, { type: 'TAKE_TWO_SAME' }> => a.type === 'TAKE_TWO_SAME')
  const reserveActions = legalActions.filter((a): a is Extract<Action, { type: 'RESERVE_CARD' }> => a.type === 'RESERVE_CARD')
  const purchaseActions = legalActions.filter(
    (a): a is Extract<Action, { type: 'PURCHASE_CARD' }> => a.type === 'PURCHASE_CARD'
  )
  const claimActions = legalActions.filter((a): a is Extract<Action, { type: 'CLAIM_NOBLE' }> => a.type === 'CLAIM_NOBLE')

  const isAITurn = currentPlayer?.isAI ?? false

  const take3RequiredCount = take3Actions[0]?.colors.length ?? 0
  const take3SelectableColors = new Set(take3Actions.flatMap((a) => a.colors))
  const take2Colors = new Set(take2Actions.map((a) => a.color))
  const reservableCardIds = new Set(reserveActions.filter((a) => !a.fromLevel).map((a) => a.cardId))
  const reservableDeckLevels = new Set(reserveActions.filter((a) => a.fromLevel).map((a) => a.fromLevel as CardLevel))
  const purchasableVisibleIds = new Set(purchaseActions.filter((a) => a.source === 'visible').map((a) => a.cardId))
  const purchasableReservedIds = new Set(purchaseActions.filter((a) => a.source === 'reserved').map((a) => a.cardId))

  function onSelectColor(color: TokenColor) {
    if (mode === 'take2') {
      dispatch({ type: 'TAKE_TWO_SAME', color })
      return
    }
    if (mode === 'take3') {
      setSelectedColors((prev) => {
        if (prev.includes(color)) return prev.filter((c) => c !== color)
        if (prev.length >= take3RequiredCount) return prev
        return [...prev, color]
      })
    }
  }

  function onConfirmTake3() {
    dispatch({ type: 'TAKE_THREE_DIFFERENT', colors: selectedColors })
  }

  function onCardClick(cardId: string) {
    if (mode === 'reserve' && reservableCardIds.has(cardId)) {
      dispatch({ type: 'RESERVE_CARD', cardId })
      return
    }
    if (mode === 'purchase') {
      const action = purchaseActions.find((a) => a.cardId === cardId)
      if (action) dispatch(action)
    }
  }

  function onDeckClick(level: CardLevel) {
    if (mode === 'reserve' && reservableDeckLevels.has(level)) {
      const action = reserveActions.find((a) => a.fromLevel === level)
      if (action) dispatch(action)
    }
  }

  const discardingPlayer = state.turnPhase === 'discard' ? state.players.find((p) => p.id === currentPlayerId) : undefined

  function handleExit() {
    if (window.confirm('Quitter la partie et revenir a l\'accueil ?')) onExit()
  }

  return (
    <div className="board">
      <div className="board-main">
        <div className="turn-banner">Au tour de {currentPlayer?.name}</div>
        <div className="panel board-panel">
          <NobleRow nobleIds={state.nobles} />
        </div>
        <div className="panel board-panel">
          <TokenBank
              bank={state.bank}
              selectableColors={
                mode === 'take3'
                    ? [...take3SelectableColors]
                    : mode === 'take2'
                        ? [...take2Colors]
                        : undefined
              }
              selectedColors={mode === 'take3' ? selectedColors : undefined}
              onSelectColor={onSelectColor}
          />
        </div>
        <CardGrid
          visibleCards={state.visibleCards}
          deckCounts={{ 1: state.decks[1].length, 2: state.decks[2].length, 3: state.decks[3].length }}
          clickableCardIds={mode === 'reserve' ? reservableCardIds : mode === 'purchase' ? purchasableVisibleIds : undefined}
          affordableCardIds={mode === 'purchase' ? purchasableVisibleIds : undefined}
          onCardClick={onCardClick}
          clickableDeckLevels={mode === 'reserve' ? reservableDeckLevels : undefined}
          onDeckClick={onDeckClick}
        />
        <div className="panel board-panel">
          {isAITurn ? (
            <p>L'IA reflechit...</p>
          ) : (
            <ActionBar
              mode={mode}
              onSetMode={setMode}
              canTake3={take3Actions.length > 0}
              canTake2={take2Actions.length > 0}
              canReserve={reserveActions.length > 0}
              canPurchase={purchaseActions.length > 0}
              take3Ready={selectedColors.length === take3RequiredCount}
              take3RequiredCount={take3RequiredCount}
              take3SelectedCount={selectedColors.length}
              onConfirmTake3={onConfirmTake3}
            />
          )}
        </div>
      </div>

      <div className="board-side">
        {state.players.map((player) => (
          <PlayerPanel
            key={player.id}
            player={player}
            isActive={player.id === currentPlayerId}
            clickableReservedCardIds={
              player.id === currentPlayerId && mode === 'purchase' ? purchasableReservedIds : undefined
            }
            affordableReservedCardIds={player.id === currentPlayerId ? purchasableReservedIds : undefined}
            onReservedCardClick={onCardClick}
          />
        ))}
      </div>

      <div className="board-footer panel">
        {!state.gameOver && (
          <button type="button" onClick={onProposeRestart} disabled={restartAwaiting}>
            {restartAwaiting ? 'En attente de la reponse...' : 'Proposer un redemarrage'}
          </button>
        )}
        <button type="button" onClick={handleExit}>
          Retour a l'accueil
        </button>
      </div>

      {discardingPlayer && isMyTurn && (
        <DiscardModal
          player={discardingPlayer}
          excess={totalTokens(discardingPlayer) - 10}
          onDiscard={(tokens: Partial<Record<Token, number>>) => dispatch({ type: 'DISCARD_TOKENS', tokens })}
        />
      )}

      {state.turnPhase === 'nobleClaim' && isMyTurn && (
        <NobleClaimBanner
          eligibleNobleIds={claimActions.map((a) => a.nobleId)}
          onClaim={(nobleId) => dispatch({ type: 'CLAIM_NOBLE', nobleId })}
        />
      )}

      {state.gameOver && <GameOverScreen state={state} onRematch={onRematch} />}

      {restartPrompt && onRespondRestart && (
        <RestartPromptModal
          message={restartPrompt}
          onAccept={() => onRespondRestart(true)}
          onDecline={() => onRespondRestart(false)}
        />
      )}

      {showError && lastError && <div className="error-toast">{lastError}</div>}

      {showYourTurnToast && <div className="your-turn-toast">C'est a toi !</div>}
    </div>
  )
}

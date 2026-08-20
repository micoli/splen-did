import { useEffect, useState } from 'react'
import { getCardDef, getNobleDef, totalTokens } from '../../engine/selectors'
import type { Action, CardLevel, GameState, Token, TokenColor } from '../../engine/types'
import type { PlayedAction } from '../../hooks/useGameEngine'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useTheme } from '../../hooks/useTheme'
import { useLanguage } from '../../i18n/LanguageContext'
import type { Translations } from '../../i18n/translations'
import { LanguageToggle } from '../shared/LanguageToggle'
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

const AI_HIGHLIGHT_DURATION_MS = 3200

function describeAction(action: Action, playerName: string, t: Translations): string {
  return t.describeAction(action, {
    playerName,
    colorLabel: t.tokenColorLabel,
    cardLevel: (cardId) => getCardDef(cardId).level,
    cardPoints: (cardId) => getCardDef(cardId).points,
    noblePoints: (nobleId) => getNobleDef(nobleId).points,
  })
}

interface BoardProps {
  state: GameState
  legalActions: Action[]
  currentPlayerId: string
  lastError: string | null
  lastPlayedAction?: PlayedAction | null
  actionLog?: PlayedAction[]
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
  lastPlayedAction,
  actionLog,
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
  const [selectedTake2Color, setSelectedTake2Color] = useState<TokenColor | undefined>(undefined)
  const [showYourTurnToast, setShowYourTurnToast] = useState(false)
  const isStickyActionBar = useMediaQuery('(max-width: 539px)')
  const isSidebarLayout = !isStickyActionBar
  const isCompactActionBar = useMediaQuery('(max-width: 640px)')
  const isWideLayout = useMediaQuery('(min-width: 641px)')
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()

  useEffect(() => {
    setMode('idle')
    setSelectedColors([])
    setSelectedTake2Color(undefined)
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

  const [aiAction, setAiAction] = useState<{
    message: string
    colors?: TokenColor[]
    purchasedSlot?: { level: CardLevel; index: number; cardId: string }
  } | null>(null)

  useEffect(() => {
    if (!lastPlayedAction) return
    const actor = state.players.find((p) => p.id === lastPlayedAction.playerId)
    if (!actor?.isAI) return
    const { action, purchasedSlot } = lastPlayedAction
    setAiAction({
      message: describeAction(action, actor.name, t),
      colors: action.type === 'TAKE_THREE_DIFFERENT' ? action.colors : action.type === 'TAKE_TWO_SAME' ? [action.color] : undefined,
      purchasedSlot: purchasedSlot && action.type === 'PURCHASE_CARD' ? { ...purchasedSlot, cardId: action.cardId } : undefined,
    })
    const timer = setTimeout(() => setAiAction(null), AI_HIGHLIGHT_DURATION_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastPlayedAction])

  const displayVisibleCards = aiAction?.purchasedSlot
    ? {
        ...state.visibleCards,
        [aiAction.purchasedSlot.level]: state.visibleCards[aiAction.purchasedSlot.level].map((cardId, index) =>
          index === aiAction.purchasedSlot!.index ? aiAction.purchasedSlot!.cardId : cardId
        ),
      }
    : state.visibleCards

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
      setSelectedTake2Color((prev) => (prev === color ? undefined : color))
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

  function onConfirmTake2() {
    if (!selectedTake2Color) return
    dispatch({ type: 'TAKE_TWO_SAME', color: selectedTake2Color })
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

  const actionBarPanel = (
    <div className="panel board-panel action-bar-panel">
      {isStickyActionBar && (
        <span className="turn-star" aria-label={isMyTurn ? t.yourTurn : t.opponentTurn}>
          {isMyTurn ? '★' : '☆'}
        </span>
      )}
      {isAITurn ? (
        <p>{t.aiThinking}</p>
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
          take2Ready={selectedTake2Color !== undefined}
          onConfirmTake2={onConfirmTake2}
          compact={isCompactActionBar}
        />
      )}
    </div>
  )

  const discardingPlayer = state.turnPhase === 'discard' ? state.players.find((p) => p.id === currentPlayerId) : undefined

  function handleExit() {
    if (window.confirm(t.exitConfirm)) onExit()
  }

  return (
    <div className="board">
      <div className="board-main">
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
              selectedColors={
                mode === 'take3' ? selectedColors : mode === 'take2' && selectedTake2Color ? [selectedTake2Color] : undefined
              }
              onSelectColor={onSelectColor}
              highlightedColors={aiAction?.colors}
          />
        </div>
        <CardGrid
          visibleCards={displayVisibleCards}
          deckCounts={{ 1: state.decks[1].length, 2: state.decks[2].length, 3: state.decks[3].length }}
          clickableCardIds={mode === 'reserve' ? reservableCardIds : mode === 'purchase' ? purchasableVisibleIds : undefined}
          affordableCardIds={mode === 'purchase' ? purchasableVisibleIds : undefined}
          onCardClick={onCardClick}
          highlightedSlot={aiAction?.purchasedSlot}
          clickableDeckLevels={mode === 'reserve' ? reservableDeckLevels : undefined}
          onDeckClick={onDeckClick}
        />
        {isStickyActionBar && actionBarPanel}
      </div>

      <div className="board-side">
        {isSidebarLayout && (
          <div className="turn-banner">{isAITurn ? t.aiThinking : t.turnOf(currentPlayer?.name ?? '')}</div>
        )}
        {isSidebarLayout && actionBarPanel}
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

      {isWideLayout && actionLog && (
        <div className="board-log panel">
          <h3>{t.history}</h3>
          <ul className="board-log__list">
            {actionLog
              .map((entry, index) => ({ entry, index }))
              .reverse()
              .map(({ entry, index }) => {
                const actor = state.players.find((p) => p.id === entry.playerId)
                return (
                  <li key={index}>{describeAction(entry.action, actor?.name ?? '?', t)}</li>
                )
              })}
          </ul>
        </div>
      )}

      <div className="board-footer panel">
        {!state.gameOver && (
          <button type="button" onClick={onProposeRestart} disabled={restartAwaiting}>
            {restartAwaiting ? t.awaitingResponse : t.proposeRestart}
          </button>
        )}
        <button type="button" onClick={handleExit}>
          {t.backHome}
        </button>
        <div className="board-footer__toggles">
          <LanguageToggle />
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t.lightMode : t.darkMode}
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
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

      {aiAction && <div className="ai-action-toast">{aiAction.message}</div>}

      {showYourTurnToast && <div className="your-turn-toast">{t.yourTurnToast}</div>}
    </div>
  )
}

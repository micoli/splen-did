import type { Action, TokenColor } from '../engine/types'

export type Lang = 'fr' | 'en'

const TOKEN_COLOR_LABELS_FR: Record<TokenColor, string> = {
  white: 'blanc',
  blue: 'bleu',
  green: 'vert',
  red: 'rouge',
  black: 'noir',
}

const TOKEN_COLOR_LABELS_EN: Record<TokenColor, string> = {
  white: 'white',
  blue: 'blue',
  green: 'green',
  red: 'red',
  black: 'black',
}

interface DescribeActionCtx {
  playerName: string
  colorLabel: (color: TokenColor) => string
  cardLevel: (cardId: string) => number
  cardPoints: (cardId: string) => number
  noblePoints: (nobleId: string) => number
}

function describeActionFr(action: Action, ctx: DescribeActionCtx): string {
  switch (action.type) {
    case 'TAKE_THREE_DIFFERENT':
      return `${ctx.playerName} a pris 3 jetons : ${action.colors.map(ctx.colorLabel).join(', ')}`
    case 'TAKE_TWO_SAME':
      return `${ctx.playerName} a pris 2 jetons ${ctx.colorLabel(action.color)}`
    case 'RESERVE_CARD':
      return `${ctx.playerName} a reserve une carte`
    case 'PURCHASE_CARD':
      return `${ctx.playerName} a achete une carte niveau ${ctx.cardLevel(action.cardId)} (${ctx.cardPoints(action.cardId)} pts)`
    case 'CLAIM_NOBLE':
      return `${ctx.playerName} a courtise un noble (${ctx.noblePoints(action.nobleId)} pts)`
    case 'DISCARD_TOKENS':
      return `${ctx.playerName} a defausse des jetons`
  }
}

function describeActionEn(action: Action, ctx: DescribeActionCtx): string {
  switch (action.type) {
    case 'TAKE_THREE_DIFFERENT':
      return `${ctx.playerName} took 3 tokens: ${action.colors.map(ctx.colorLabel).join(', ')}`
    case 'TAKE_TWO_SAME':
      return `${ctx.playerName} took 2 ${ctx.colorLabel(action.color)} tokens`
    case 'RESERVE_CARD':
      return `${ctx.playerName} reserved a card`
    case 'PURCHASE_CARD':
      return `${ctx.playerName} bought a level ${ctx.cardLevel(action.cardId)} card (${ctx.cardPoints(action.cardId)} pts)`
    case 'CLAIM_NOBLE':
      return `${ctx.playerName} was visited by a noble (${ctx.noblePoints(action.nobleId)} pts)`
    case 'DISCARD_TOKENS':
      return `${ctx.playerName} discarded tokens`
  }
}

export interface Translations {
  tokenColorLabel: (color: TokenColor) => string
  describeAction: (action: Action, ctx: DescribeActionCtx) => string

  appTagline: string

  modeSolo: string
  modeHotseat: string
  modeOnline: string

  soloTitle: string
  namePlaceholder: string
  defaultPlayerName: string
  aiName: string
  startGame: string

  hotseatTitle: string
  playerCount: (count: number) => string
  playerPlaceholder: (i: number) => string

  p2pTitle: string
  p2pDescription: string
  p2pHost: string
  p2pJoin: string

  hostTitle: string
  hostCreate: string
  hostStep1: string
  hostStep2: string
  hostAnswerPlaceholder: string
  hostConnecting: string
  hostConnect: string
  hostInvalidAnswer: string

  joinTitle: string
  joinStep1: string
  joinOfferPlaceholder: string
  joinAction: string
  joinStep2: string
  joinWaiting: string
  joinInvalidCode: string

  scanQRCode: string
  copy: string
  copied: string
  cancel: string
  qrTooLong: string
  cameraError: string

  aiThinking: string
  yourTurn: string
  opponentTurn: string
  turnOf: (name: string) => string
  history: string
  proposeRestart: string
  awaitingResponse: string
  backHome: string
  exitConfirm: string
  lightMode: string
  darkMode: string
  yourTurnToast: string
  deckReserve: string

  take3: string
  take2: string
  reserve: string
  purchase: string
  confirm: (selected: number, required: number) => string
  confirmShort: string

  discardTitle: (excess: number) => string
  discardDescription: string
  discardConfirm: string

  gameOverTitle: string
  gameOverResult: (name: string, points: number, cardCount: number) => string
  gameOverWinnerSuffix: string
  newGame: string

  nobleTitle: string
  nobleDescription: string

  restartTitle: string
  restartAccept: string
  restartDecline: string
  restartPrompt: (name: string) => string
  restartPeerRequested: string

  waitingForGame: string
  hostPlayerName: string
  guestPlayerName: string

  language: string
}

const fr: Translations = {
  tokenColorLabel: (color: TokenColor) => TOKEN_COLOR_LABELS_FR[color],
  describeAction: describeActionFr,

  appTagline: 'Collectionnez des gemmes, courtisez des nobles, gagnez la partie.',

  modeSolo: 'Solo vs IA',
  modeHotseat: 'Local',
  modeOnline: 'En ligne',

  soloTitle: "Solo contre l'ordinateur",
  namePlaceholder: 'Votre nom',
  defaultPlayerName: 'Joueur',
  aiName: 'IA',
  startGame: 'Commencer la partie',

  hotseatTitle: 'Partie locale (pass-and-play)',
  playerCount: (count: number) => `${count} joueurs`,
  playerPlaceholder: (i: number) => `Joueur ${i}`,

  p2pTitle: 'Partie en ligne (P2P, sans serveur)',
  p2pDescription: "Aucun serveur n'est utilise : un code doit etre echange manuellement entre les deux joueurs.",
  p2pHost: 'Heberger',
  p2pJoin: 'Rejoindre',

  hostTitle: 'Heberger une partie',
  hostCreate: 'Creer la partie',
  hostStep1: 'Envoyez ce code a votre adversaire, ou faites-lui scanner le QR code :',
  hostStep2: "Collez ici le code de reponse qu'il vous envoie, ou scannez son QR code :",
  hostAnswerPlaceholder: 'Code de reponse',
  hostConnecting: 'Connexion en cours...',
  hostConnect: 'Connecter',
  hostInvalidAnswer: 'Reponse invalide, verifiez le texte colle.',

  joinTitle: 'Rejoindre une partie',
  joinStep1: "Collez ici le code recu de l'hote, ou scannez son QR code :",
  joinOfferPlaceholder: "Code de l'hote",
  joinAction: 'Rejoindre',
  joinStep2: "Renvoyez ce code a l'hote pour finaliser la connexion, ou faites-lui scanner le QR code :",
  joinWaiting: 'En attente de connexion...',
  joinInvalidCode: 'Code invalide, verifiez le texte colle.',

  scanQRCode: 'Scanner un QR code',
  copy: 'Copier',
  copied: 'Copie !',
  cancel: 'Annuler',
  qrTooLong: 'Code trop long pour un QR code, utilisez le copier-coller.',
  cameraError: "Impossible d'acceder a la camera.",

  aiThinking: "L'IA reflechit...",
  yourTurn: 'Ton tour',
  opponentTurn: 'Tour adverse',
  turnOf: (name: string) => `Au tour de ${name}`,
  history: 'Historique',
  proposeRestart: 'Proposer un redemarrage',
  awaitingResponse: 'En attente de la reponse...',
  backHome: "Retour a l'accueil",
  exitConfirm: "Quitter la partie et revenir a l'accueil ?",
  lightMode: 'Passer en mode clair',
  darkMode: 'Passer en mode sombre',
  yourTurnToast: "C'est a toi !",
  deckReserve: 'Piocher une carte',

  take3: 'Prendre 3 jetons',
  take2: 'Prendre 2 jetons',
  reserve: 'Réserver une carte',
  purchase: 'Acheter une carte',
  confirm: (selected: number, required: number) => `Confirmer (${selected}/${required})`,
  confirmShort: 'Confirmer',

  discardTitle: (excess: number) => `Defausser ${excess} jeton(s)`,
  discardDescription: 'Vous avez plus de 10 jetons, choisissez lesquels defausser.',
  discardConfirm: 'Confirmer la defausse',

  gameOverTitle: 'Partie terminee',
  gameOverResult: (name: string, points: number, cardCount: number) => `${name} - ${points} pts (${cardCount} cartes)`,
  gameOverWinnerSuffix: ' - Vainqueur',
  newGame: 'Nouvelle partie',

  nobleTitle: 'Choisissez un noble',
  nobleDescription: 'Plusieurs nobles peuvent vous rendre visite, choisissez lequel.',

  restartTitle: 'Redemarrer la partie ?',
  restartAccept: 'Accepter',
  restartDecline: 'Refuser',
  restartPrompt: (name: string) => `${name}, acceptez-vous de redemarrer la partie ?`,
  restartPeerRequested: "L'adversaire propose de redemarrer la partie. Acceptez-vous ?",

  waitingForGame: 'En attente de la partie...',
  hostPlayerName: 'Hote',
  guestPlayerName: 'Invite',

  language: 'Langue',
}

const en: Translations = {
  tokenColorLabel: (color: TokenColor) => TOKEN_COLOR_LABELS_EN[color],
  describeAction: describeActionEn,

  appTagline: 'Collect gems, court nobles, win the game.',

  modeSolo: 'Solo vs AI',
  modeHotseat: 'Local',
  modeOnline: 'Online',

  soloTitle: 'Solo vs the computer',
  namePlaceholder: 'Your name',
  defaultPlayerName: 'Player',
  aiName: 'AI',
  startGame: 'Start game',

  hotseatTitle: 'Local game (pass-and-play)',
  playerCount: (count: number) => `${count} players`,
  playerPlaceholder: (i: number) => `Player ${i}`,

  p2pTitle: 'Online game (P2P, no server)',
  p2pDescription: 'No server is used: a code must be exchanged manually between the two players.',
  p2pHost: 'Host',
  p2pJoin: 'Join',

  hostTitle: 'Host a game',
  hostCreate: 'Create game',
  hostStep1: 'Send this code to your opponent, or have them scan the QR code:',
  hostStep2: 'Paste the reply code they send you here, or scan their QR code:',
  hostAnswerPlaceholder: 'Reply code',
  hostConnecting: 'Connecting...',
  hostConnect: 'Connect',
  hostInvalidAnswer: 'Invalid reply, check the pasted text.',

  joinTitle: 'Join a game',
  joinStep1: "Paste the host's code here, or scan their QR code:",
  joinOfferPlaceholder: "Host's code",
  joinAction: 'Join',
  joinStep2: 'Send this code back to the host to finish connecting, or have them scan the QR code:',
  joinWaiting: 'Waiting for connection...',
  joinInvalidCode: 'Invalid code, check the pasted text.',

  scanQRCode: 'Scan a QR code',
  copy: 'Copy',
  copied: 'Copied!',
  cancel: 'Cancel',
  qrTooLong: 'Code too long for a QR code, use copy-paste instead.',
  cameraError: 'Unable to access the camera.',

  aiThinking: 'AI is thinking...',
  yourTurn: 'Your turn',
  opponentTurn: "Opponent's turn",
  turnOf: (name: string) => `${name}'s turn`,
  history: 'History',
  proposeRestart: 'Propose a restart',
  awaitingResponse: 'Waiting for response...',
  backHome: 'Back to home',
  exitConfirm: 'Leave the game and go back to the home page?',
  lightMode: 'Switch to light mode',
  darkMode: 'Switch to dark mode',
  yourTurnToast: "It's your turn!",
  deckReserve: 'Draw a card',

  take3: 'Take 3 tokens',
  take2: 'Take 2 tokens',
  reserve: 'Reserve a card',
  purchase: 'Buy a card',
  confirm: (selected: number, required: number) => `Confirm (${selected}/${required})`,
  confirmShort: 'Confirm',

  discardTitle: (excess: number) => `Discard ${excess} token(s)`,
  discardDescription: 'You have more than 10 tokens, choose which ones to discard.',
  discardConfirm: 'Confirm discard',

  gameOverTitle: 'Game over',
  gameOverResult: (name: string, points: number, cardCount: number) => `${name} - ${points} pts (${cardCount} cards)`,
  gameOverWinnerSuffix: ' - Winner',
  newGame: 'New game',

  nobleTitle: 'Choose a noble',
  nobleDescription: 'Several nobles can visit you, choose which one.',

  restartTitle: 'Restart the game?',
  restartAccept: 'Accept',
  restartDecline: 'Decline',
  restartPrompt: (name: string) => `${name}, do you agree to restart the game?`,
  restartPeerRequested: 'Your opponent proposes restarting the game. Do you agree?',

  waitingForGame: 'Waiting for the game...',
  hostPlayerName: 'Host',
  guestPlayerName: 'Guest',

  language: 'Language',
}

export const TRANSLATIONS: Record<Lang, Translations> = { fr, en }

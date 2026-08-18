# Splen-did

Version web du jeu de societe [Splendor](https://www.regledujeu.fr/splendor/), en TypeScript + React, sans backend.

## Modes de jeu

- **Solo vs IA** : IA heuristique locale (regles simples, pas de recherche/minimax).
- **Local (pass-and-play)** : 2 a 4 joueurs sur le meme ecran.
- **En ligne (P2P)** : connexion directe entre deux navigateurs via WebRTC, sans serveur de signaling. L'hote genere un code (offer SDP) a envoyer manuellement (copier-coller) a l'adversaire, qui renvoie un code de reponse pour finaliser la connexion.

## Limitations connues

- Le P2P utilise uniquement un serveur STUN public (pas de TURN, impossible sans backend) : la connexion peut echouer sur certains reseaux stricts (NAT symetrique, pare-feu d'entreprise).
- Le P2P est prevu pour exactement 2 joueurs.

## Developpement

```bash
npm install
npm run dev      # serveur de developpement
npm test         # tests unitaires (Vitest)
npm run build    # build de production
```

## Deploiement

Le workflow `.github/workflows/deploy.yml` publie automatiquement `dist/` sur GitHub Pages a chaque push sur `main` (via GitHub Actions, source Pages a activer une fois dans Settings > Pages > Source: GitHub Actions).

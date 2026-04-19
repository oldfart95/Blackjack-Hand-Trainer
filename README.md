# Blackjack Basic Strategy Drill Trainer

Single-page React + TypeScript + Vite app for drilling blackjack basic strategy decisions.

## Features

- One-scenario-at-a-time decision drills.
- Actions: Hit / Stand / Double / Split / Surrender.
- Immediate correctness + deterministic bucket explanation.
- Modes: mixed, hard-only, soft-only, pairs-only, trouble-hands, exam, missed-only.
- Adaptive pressure mode that increases weak-spot frequency.
- Session stats with streaks, leak categories, and session summary.
- Learn mode hints and coach panel.
- Keyboard shortcuts:
  - `H` Hit
  - `S` Stand
  - `D` Double
  - `P` Split
  - `R` Surrender
  - `N` Next
- Local storage persistence for settings, stats, and adaptive profile.

## Strategy basis

V1 defaults to a multi-deck style strategy preset:

- Dealer stands on soft 17 (S17)
- Double after split disabled
- Late surrender enabled

Architecture supports future presets (H17/DAS/surrender toggles).

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

This repository is configured with Vite base path defaulting to `/Blackjack-Hand-Trainer/`.

1. Build static output:

   ```bash
   npm install
   npm run build
   ```

2. Publish `dist/` to GitHub Pages (via Actions or `gh-pages` branch).

If your repo path differs, set `VITE_BASE`:

```bash
VITE_BASE=/your-repo-name/ npm run build
```

## Scope guardrails

- Study instrument only.
- No bankroll, chips, betting loop, or dealing animations.
- Focus is rapid memorization of correct basic-strategy starting decisions.

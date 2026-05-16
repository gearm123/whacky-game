# Whacky Slot

React frontend for `Whacky Slot`, with gameplay resolved in the browser and wallet/account sync handled by a separate backend service.

## Theme

- Greek empire cartoon styling
- Zany slapstick energy inspired by classic animated chaos
- No branded or copied characters

## Architecture

- `src/` contains the React frontend and slot cabinet UI
- backend is a sibling project at `C:\Users\gilak\Pictures\olympus-giggle-reels-backend`
- Frontend resolves spins, paylines, events, bonus flow, and UI state locally
- Backend exposes wallet/account endpoints used to load and settle the player balance
- The Vite proxy still forwards `/api/*` requests to the backend service

## Configured gameplay

- Spin cost: 100 fake coins
- Target RTP: 93.5%
- House edge: 6.5%
- Hit frequency target: 40%
- Volatility: medium
- 5 reels x 3 rows x 10 paylines
- Wilds, scatters, free spins, and bonus-round feature

## Run locally

Install once:

```bash
npm install
```

Start the wallet/account backend in one terminal:

```bash
cd C:\Users\gilak\Pictures\olympus-giggle-reels-backend
npm install
npm run dev
```

Start the frontend in a second terminal:

```bash
cd C:\Users\gilak\Pictures\imperium-reels
npm install
npm run dev
```

The frontend uses the Vite proxy and calls the backend through `/api/*` for wallet/account state only.

## Live flow

- The app starts directly in the live frontend-owned gameplay flow
- Spins and special events resolve in the browser
- Each resolved balance change is synced to the backend wallet service
- The backend is responsible for account state and future billing/user-management work

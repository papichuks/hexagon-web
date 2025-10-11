# Hexagon Next.js Frontend (Hedera + RainbowKit)

This is a fresh Next.js app that replaces the legacy CRA frontend. It uses RainbowKit + Wagmi for wallet connection and targets the Hedera Testnet.

## Prerequisites

- Node.js 18+

## Setup

```
cd new-frontend
npm install
```

Create `.env.local` with:

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_cloud_project_id
NEXT_PUBLIC_HEXAGON_ADDRESS=0xYourDeployedHexagonOnHederaTestnet
```

## Develop

```
npm run dev
```

Open http://localhost:3000

## Structure

- `src/app` — App Router pages (`/`, `/verification`, `/manufacturer`)
- `src/providers/wallet.tsx` — Wagmi, RainbowKit, React Query, Chakra providers
- `src/lib/wagmi.ts` — Hedera testnet chain + client config
- `src/abi/Hexagon.json` — Contract ABI used by components


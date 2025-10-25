# Hexagon

Hexagon is a decentralized product-authentication platform built for the Hedera Africa Hackathon.  
Manufacturers mint tamper-proof batches on the Hedera network, while distributors and customers verify any individual item by scanning a generated QR code. The goal is to curb counterfeit pharmaceuticals across the continent by pairing an intuitive web experience with verifiable, on-chain provenance.

## Architecture
- `contract/` — Hardhat project containing the `Hexagon.sol` smart contract (Solidity 0.8.28) plus deployment utilities written in TypeScript. The contract is designed for the Hedera EVM network and encodes manufacturer onboarding, product lifecycle management, and single-use verification codes.
- `frontend/` — Next.js 14 (App Router) application that wraps RainbowKit, Wagmi, and Chakra UI to deliver the manufacturer dashboard, verification tools, and analytics screens.
- `utils/` — Environment configuration shared by the frontend (e.g., Hedera RPC gateway, smart-contract address).

## Tech Stack
- Hedera Hashgraph testnet via HashIO RPC
- Solidity 0.8.28, Hardhat 3, ethers.js v6
- TypeScript across smart-contract tooling and the web dApp
- Next.js 14, React 18, Chakra UI, RainbowKit, Wagmi, Viem
- Pinata IPFS gateway for storing product metadata blobs

## Getting Started

### Prerequisites
- Node.js 18 or newer and npm 9+
- Git
- A Hedera testnet account with an EVM private key (exported as a hex string)

### Clone the repository
```bash
git clone https://github.com/Hexdee/Hexagon.git
cd Hexagon
```

### Configure the smart contract workspace
```bash
cd contract
npm install
```
Create a `.env` file in `contract/`:
```bash
PRIVATE_KEY=0xYourHederaEvmPrivateKey
# Optional overrides if you prefer custom RPC or a different deployer
# SEPOLIA_RPC_URL=
# SEPOLIA_PRIVATE_KEY=
```
Then compile, test, and deploy:
```bash
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts --network hederaTestnet
```
When the deployment completes, note the printed contract address and copy it into the frontend environment.

### Configure and run the frontend
```bash
cd ../frontend
npm install
cp .env.example .env
```
Edit `.env` with the addresses that match your deployment:
```bash
NEXT_PUBLIC_HEXAGON_ADDRESS=0xDeployedContractAddress
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=yourWalletConnectProjectId
NEXT_PUBLIC_GATEWAY_URL=ipfs.io
PINATA_JWT=OptionalServerSideToken
```
Start the development server:
```bash
npm run dev
```
Visit `http://localhost:3000` to interact with the dashboard, onboard manufacturers, and verify codes.

## How It Works
1. **Manufacturer onboarding** — Approved partners register on-chain and receive a dedicated workspace in the frontend.
2. **Product creation** — Each product record stores metadata, a reference to the Pinata-hosted description, and total production volume.
3. **Code generation** — The dashboard issues short-lived QR/alpha-numeric codes; their hashed counterparts are registered on-chain for future validation.
4. **Customer verification** — Scanning, or manually entering, a code triggers an on-chain authenticity check and permanently marks the item as sold to prevent reuse.

## Contributing
Pull requests are welcome. Please fork the repo, create a feature branch, ensure `npm run lint` / `npx hardhat test` pass, and open a PR describing your change. For major features, open an issue first to discuss the approach.

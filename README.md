# NFT Pawn DApp

A decentralized NFT-backed lending platform built on Solana using Anchor framework and Next.js.

## Project Structure

```
anchor-nftpawn/
├── anchor/                    # Solana Program (Anchor)
│   ├── Anchor.toml           # Anchor configuration
│   ├── Cargo.toml            # Rust dependencies
│   ├── Cargo.lock            # Rust lock file
│   ├── programs/             # Solana programs
│   ├── tests/                # Program tests
│   ├── migrations/           # Deployment scripts
│   ├── target/               # Build artifacts
│   ├── idl.ts               # Program IDL
│   ├── package.json         # Anchor dependencies
│   └── tsconfig.json        # TypeScript config for tests
├── app/                      # Next.js App Router
├── components/               # React components
├── lib/                      # Frontend utilities
├── types/                    # TypeScript type definitions
├── package.json             # Frontend dependencies
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── README.md                # This file
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Rust and Cargo
- Solana CLI
- Anchor CLI

### Installation

1. **Install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Install anchor dependencies:**
   ```bash
   cd anchor
   npm install
   ```

### Development

1. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

2. **Build and test the Solana program:**
   ```bash
   npm run anchor:build
   npm run anchor:test
   ```

3. **Deploy to localnet:**
   ```bash
   npm run anchor:deploy
   ```

### Available Scripts

#### Frontend (Next.js)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

#### Anchor Program
- `npm run anchor:build` - Build the Solana program
- `npm run anchor:test` - Run program tests
- `npm run anchor:deploy` - Deploy to localnet
- `npm run anchor:deploy:devnet` - Deploy to devnet
- `npm run anchor:deploy:mainnet` - Deploy to mainnet

## Features

- **NFT Deposits**: Users can deposit NFTs as collateral
- **Lending**: Lenders can provide SOL loans against NFT collateral
- **Repayment**: Borrowers can repay loans and retrieve their NFTs
- **Escrow System**: Secure escrow mechanism for NFT and SOL handling
- **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS

## Technology Stack

- **Blockchain**: Solana, Anchor Framework
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Wallet Integration**: Solana Wallet Adapter
- **Testing**: Mocha, Chai

## License

MIT 
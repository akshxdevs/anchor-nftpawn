# NFT Pawn DApp

A decentralized NFT-backed lending platform built on Solana using Anchor framework and Next.js.

## Features

- 🎨 **Modern UI/UX**: Beautiful, responsive design with smooth animations
- 🔐 **Secure**: Built on Solana blockchain with Anchor framework
- ⚡ **Fast**: Instant loan processing and NFT transfers
- 💰 **Transparent**: All transactions are publicly verifiable
- 🎯 **User-Friendly**: Intuitive interface for borrowing, lending, and repaying

## Smart Contract Features

- **NFT Deposits**: Users can deposit NFTs as collateral
- **Instant Loans**: Get liquidity immediately against your NFTs
- **Flexible Repayment**: Repay loans and retrieve your NFTs
- **Interest Earning**: Lenders can earn interest on their deposits
- **Loan History**: Complete audit trail of all loan transactions

## Tech Stack

### Backend
- **Solana**: High-performance blockchain
- **Anchor**: Framework for Solana program development
- **Rust**: Smart contract language

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations
- **Solana Wallet Adapter**: Wallet integration

## Prerequisites

- Node.js 18+ 
- Rust and Cargo
- Solana CLI tools
- Anchor CLI

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd anchor-nftpawn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the smart contract**
   ```bash
   anchor build
   ```

4. **Generate TypeScript types**
   ```bash
   anchor build
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Smart Contract Setup

1. **Configure Solana cluster**
   ```bash
   solana config set --url devnet
   ```

2. **Build and deploy**
   ```bash
   anchor build
   anchor deploy
   ```

3. **Update program ID**
   After deployment, update the program ID in:
   - `lib/anchor.ts`
   - `programs/anchor-nftpawn/src/lib.rs`

## Usage

### For Borrowers

1. **Connect Wallet**: Use Phantom or any Solana wallet
2. **Select "Borrow" Tab**: Choose the borrow option
3. **Enter NFT Details**: Provide your NFT mint address
4. **Set Loan Amount**: Specify how much you want to borrow
5. **Submit Transaction**: Confirm the loan request

### For Lenders

1. **Connect Wallet**: Use your Solana wallet
2. **Select "Lend" Tab**: Choose the lend option
3. **Browse Available Loans**: View active loan requests
4. **Fund Loan**: Provide liquidity to earn interest
5. **Monitor Returns**: Track your earnings

### For Repayment

1. **Select "Repay" Tab**: Choose the repay option
2. **View Active Loans**: See your outstanding loans
3. **Calculate Repayment**: Check total amount due
4. **Submit Payment**: Repay and retrieve your NFT

## Project Structure

```
anchor-nftpawn/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── lib/                   # Utility libraries
│   └── anchor.ts          # Anchor client
├── programs/              # Smart contracts
│   └── anchor-nftpawn/
│       └── src/
│           └── lib.rs     # Main program
├── tests/                 # Test files
├── target/                # Build artifacts
└── migrations/            # Deployment scripts
```

## Smart Contract Functions

### Core Functions

- `initialize(loan_amount)`: Initialize the program with loan amount
- `deposite()`: Deposit NFT and create loan request
- `lend_borrower()`: Provide liquidity to active loans
- `repay_borrower()`: Repay loan and retrieve NFT

### Account Structures

- **Config**: Program configuration and admin settings
- **Loan**: Individual loan details and status
- **LoanDetails**: Transaction history and loan metadata
- **Escrow**: NFT and SOL escrow management

## Development

### Running Tests
```bash
anchor test
```

### Building for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Open an issue on GitHub
- Join our Discord community
- Check the documentation

## Roadmap

- [ ] Multi-chain support
- [ ] Advanced NFT valuation
- [ ] Liquidation mechanisms
- [ ] Governance tokens
- [ ] Mobile app
- [ ] API integration

---

Built with ❤️ on Solana 
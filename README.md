# NFT Pawn DApp

A decentralized NFT-backed lending platform built on Solana using Anchor framework.

## Features

- **Borrow**: Deposit your NFTs and get instant SOL liquidity
- **Lend**: Earn interest by lending SOL to NFT-backed loans
- **Repay**: Repay your loans and get your NFTs back
- **Secure**: All transactions are secured by Solana's blockchain
- **Transparent**: All loan details are publicly verifiable

## Prerequisites

- Node.js (v16 or higher)
- Yarn or npm
- Solana CLI tools
- Anchor CLI
- A Solana wallet (Phantom, Solflare, etc.)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd anchor-nftpawn
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Build the Solana program**
   ```bash
   anchor build
   ```

4. **Deploy the program**
   ```bash
   anchor deploy
   ```

5. **Initialize the program**
   ```bash
   anchor run deploy
   ```

6. **Start the development server**
   ```bash
   yarn dev
   ```

## Usage

### For Borrowers

1. Connect your wallet using the "Connect Wallet" button
2. Navigate to the "Borrow" tab
3. Enter your NFT mint address
4. Enter the loan amount you want to borrow
5. Click "Borrow Now" to submit your loan request

### For Lenders

1. Connect your wallet
2. Navigate to the "Lend" tab
3. View available loan requests
4. Click "Lend" on any loan you want to fund
5. Confirm the transaction in your wallet

### For Repayment

1. Connect your wallet
2. Navigate to the "Repay" tab
3. View your active loans
4. Click "Repay" on any loan you want to repay
5. Confirm the transaction in your wallet

## Contract Functions

### `initialize(loan_amount: u64)`
Initializes the program with a default loan amount.

### `deposite()`
Deposits an NFT and creates a loan request.

### `lend_borrower()`
Funds a loan request with SOL.

### `repay_borrower()`
Repays a loan and returns the NFT to the borrower.

## Development

### Project Structure

```
anchor-nftpawn/
├── app/                    # Next.js frontend
├── components/             # React components
├── lib/                    # Utility functions and contracts
├── programs/               # Solana program (Rust)
├── migrations/             # Deployment scripts
└── tests/                  # Test files
```

### Key Files

- `programs/anchor-nftpawn/src/lib.rs` - Main Solana program
- `lib/anchor.ts` - TypeScript client for the program
- `lib/idl.ts` - Interface definition for the program
- `app/page.tsx` - Main application interface

### Testing

Run the test suite:
```bash
anchor test
```

## Configuration

The application is configured to use:
- **Network**: Devnet (for development)
- **Program ID**: `GPCJ1xf8hidp64X5xRGUEdq171bgXoRVvBdLM7VNidoU`
- **Default Loan Amount**: 1 SOL (1,000,000,000 lamports)

## Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Make sure you have a Solana wallet installed
   - Check that you're on the correct network (Devnet)

2. **Transaction Failed**
   - Ensure you have enough SOL for transaction fees
   - Check that the NFT mint address is valid
   - Verify you own the NFT you're trying to deposit

3. **Program Not Found**
   - Make sure the program is deployed to the correct network
   - Verify the program ID in the configuration

### Getting SOL for Testing

To get devnet SOL for testing:
```bash
solana airdrop 2 <your-wallet-address> --url devnet
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 
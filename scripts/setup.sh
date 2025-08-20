#!/bin/bash

echo "🚀 Setting up NFT Pawn DApp..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust is not installed. Please install Rust first."
    exit 1
fi

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI is not installed. Please install Solana CLI first."
    exit 1
fi

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor CLI is not installed. Please install Anchor CLI first."
    exit 1
fi

echo "✅ All prerequisites are installed!"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the smart contract
echo "🔨 Building smart contract..."
anchor build

# Generate types
echo "📝 Generating TypeScript types..."
anchor build

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your Solana cluster: solana config set --url devnet"
echo "2. Deploy the smart contract: anchor deploy"
echo "3. Update the program ID in lib/anchor.ts and programs/anchor-nftpawn/src/lib.rs"
echo "4. Start the development server: npm run dev"
echo ""
echo "Happy coding! 🚀" 
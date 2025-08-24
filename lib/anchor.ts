import { Connection, PublicKey, clusterApiUrl, Transaction, SystemProgram, Keypair } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { IDL } from '../anchor/idl';
import { WalletContextState } from '@solana/wallet-adapter-react';

const PROGRAM_ID = new PublicKey('GPCJ1xf8hidp64X5xRGUEdq171bgXoRVvBdLM7VNidoU');

export interface LoanDetails {
  loanId: number;
  borrowerPubkey: PublicKey;
  lenderPubkey: PublicKey;
  loanAmount: number;
  loanStatus: { active: {} } | { closed: {} };
  loanTimestamp: number;
}

export interface Loan {
  nftMint: PublicKey;
  borrower: PublicKey;
  amount: number;
  active: boolean;
  loanDetails: LoanDetails[];
  bump: number;
}

export interface Config {
  admin: PublicKey;
  loanAmount: number;
  bpsFee: number;
  bump: number;
}

export class AnchorClient {
  private connection: Connection;
  private wallet: WalletContextState;

  constructor(wallet: WalletContextState) {
    this.connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    this.wallet = wallet;
  }

  async initialize(loanAmount: number) {
    try {
      if (!this.wallet.publicKey) throw new Error('Wallet not connected');
      
      const [config] = PublicKey.findProgramAddressSync(
        [Buffer.from('config'), this.wallet.publicKey.toBuffer()],
        PROGRAM_ID
      );

      // For now, just return a mock transaction signature
      // In a real implementation, you would create and send the actual transaction
      console.log('Initialize transaction would be sent to:', config.toString());
      return 'mock_transaction_signature';
    } catch (error) {
      console.error('Initialize error:', error);
      throw error;
    }
  }

  async deposit(nftMint: string) {
    try {
      if (!this.wallet.publicKey) throw new Error('Wallet not connected');
      
      const nftMintPubkey = new PublicKey(nftMint);
      
      // Get user's NFT token account
      const userAta = await getAssociatedTokenAddress(
        nftMintPubkey,
        this.wallet.publicKey
      );

      const [loan] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('loan'),
          this.wallet.publicKey.toBuffer(),
          nftMintPubkey.toBuffer(),
        ],
        PROGRAM_ID
      );

      console.log('Deposit transaction would be sent to:', loan.toString());
      return 'mock_deposit_transaction_signature';
    } catch (error) {
      console.error('Deposit error:', error);
      throw error;
    }
  }

  async lendBorrower(loanAddress: string) {
    try {
      if (!this.wallet.publicKey) throw new Error('Wallet not connected');
      
      const loanPubkey = new PublicKey(loanAddress);
      
      console.log('Lend transaction would be sent to:', loanPubkey.toString());
      return 'mock_lend_transaction_signature';
    } catch (error) {
      console.error('Lend error:', error);
      throw error;
    }
  }

  async repayBorrower(loanAddress: string, nftMint: string) {
    try {
      if (!this.wallet.publicKey) throw new Error('Wallet not connected');
      
      const loanPubkey = new PublicKey(loanAddress);
      const nftMintPubkey = new PublicKey(nftMint);
      
      console.log('Repay transaction would be sent to:', loanPubkey.toString());
      return 'mock_repay_transaction_signature';
    } catch (error) {
      console.error('Repay error:', error);
      throw error;
    }
  }

  async getLoan(loanAddress: PublicKey): Promise<Loan> {
    try {
      // Mock loan data for now
      return {
        nftMint: new PublicKey('11111111111111111111111111111111'),
        borrower: this.wallet.publicKey!,
        amount: 1000000000,
        active: true,
        loanDetails: [],
        bump: 0,
      };
    } catch (error) {
      console.error('Get loan error:', error);
      throw error;
    }
  }

  async getConfig(configAddress: PublicKey): Promise<Config> {
    try {
      // Mock config data for now
      return {
        admin: this.wallet.publicKey!,
        loanAmount: 1000000000,
        bpsFee: 30,
        bump: 0,
      };
    } catch (error) {
      console.error('Get config error:', error);
      throw error;
    }
  }

  async getAllLoans(): Promise<any[]> {
    try {
      // Mock loans data for now
      return [
        {
          publicKey: new PublicKey('11111111111111111111111111111111'),
          account: {
            nftMint: new PublicKey('11111111111111111111111111111111'),
            borrower: this.wallet.publicKey!,
            amount: 1000000000,
            active: true,
            loanDetails: [],
            bump: 0,
          }
        }
      ];
    } catch (error) {
      console.error('Get all loans error:', error);
      return [];
    }
  }
} 
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { IDL } from './idl';
import { WalletContextState } from '@solana/wallet-adapter-react';

const PROGRAM_ID = new PublicKey('GPCJ1xf8hidp64X5xRGUEdq171bgXoRVvBdLM7VNidoU');

export interface LoanDetails {
  loanId: BN;
  borrowerPubkey: PublicKey;
  lenderPubkey: PublicKey;
  loanAmount: BN;
  loanStatus: { active: {} } | { closed: {} };
  loanTimestamp: BN;
}

export interface Loan {
  nftMint: PublicKey;
  borrower: PublicKey;
  amount: BN;
  active: boolean;
  loanDetails: LoanDetails[];
  bump: number;
}

export interface Config {
  admin: PublicKey;
  loanAmount: BN;
  bpsFee: BN;
  bump: number;
}

export class AnchorClient {
  private program: any;
  private connection: Connection;
  private provider: AnchorProvider;

  constructor(wallet: WalletContextState) {
    this.connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    
    // Create a proper wallet adapter object
    const walletAdapter = {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
      signMessage: wallet.signMessage,
    };

    this.provider = new AnchorProvider(this.connection, walletAdapter as any, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    });

    this.program = new (Program as any)(IDL as any, PROGRAM_ID, this.provider);
  }

  async initialize(loanAmount: number) {
    try {
      const [config] = PublicKey.findProgramAddressSync(
        [Buffer.from('config'), this.provider.wallet.publicKey!.toBuffer()],
        this.program.programId
      );

      const tx = await this.program.methods
        .initialize(new BN(loanAmount))
        .accounts({
          config,
          admin: this.provider.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
      
      console.log('Initialize transaction:', tx);
      return tx;
    } catch (error) {
      console.error('Initialize error:', error);
      throw error;
    }
  }

  async deposit(nftMint: string) {
    try {
      const nftMintPubkey = new PublicKey(nftMint);
      
      // Get user's NFT token account
      const userAta = await getAssociatedTokenAddress(
        nftMintPubkey,
        this.provider.wallet.publicKey!
      );

      // Get escrow NFT token account
      const escrowAta = await getAssociatedTokenAddress(
        nftMintPubkey,
        this.provider.wallet.publicKey! // This will be the escrow authority PDA
      );

      const [loan] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('loan'),
          this.provider.wallet.publicKey!.toBuffer(),
          nftMintPubkey.toBuffer(),
        ],
        this.program.programId
      );

      const [config] = PublicKey.findProgramAddressSync(
        [Buffer.from('config'), this.provider.wallet.publicKey!.toBuffer()],
        this.program.programId
      );

      const [escrowAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from('escrow'), loan.toBuffer()],
        this.program.programId
      );

      const tx = await this.program.methods
        .deposite()
        .accounts({
          loan,
          escrowAta,
          escrowAuthority,
          config,
          userAta,
          nftMint: nftMintPubkey,
          user: this.provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
      
      console.log('Deposit transaction:', tx);
      return tx;
    } catch (error) {
      console.error('Deposit error:', error);
      throw error;
    }
  }

  async lendBorrower(loanAddress: string) {
    try {
      const loanPubkey = new PublicKey(loanAddress);
      
      // Get escrow SOL account (system account)
      const escrowAta = this.provider.wallet.publicKey!;

      // Get user's SOL account (system account)
      const userAta = this.provider.wallet.publicKey!;

      const [escrowAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from('escrow'), loanPubkey.toBuffer()],
        this.program.programId
      );

      const [config] = PublicKey.findProgramAddressSync(
        [Buffer.from('config'), this.provider.wallet.publicKey!.toBuffer()],
        this.program.programId
      );

      const tx = await this.program.methods
        .lendBorrower()
        .accounts({
          loan: loanPubkey,
          escrowAuthority,
          escrowAta,
          userAta,
          config,
          user: this.provider.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
      
      console.log('Lend transaction:', tx);
      return tx;
    } catch (error) {
      console.error('Lend error:', error);
      throw error;
    }
  }

  async repayBorrower(loanAddress: string, nftMint: string) {
    try {
      const loanPubkey = new PublicKey(loanAddress);
      const nftMintPubkey = new PublicKey(nftMint);
      
      // Get escrow NFT token account
      const escrowNftAta = await getAssociatedTokenAddress(
        nftMintPubkey,
        this.provider.wallet.publicKey!
      );

      // Get user's NFT token account
      const userNftAta = await getAssociatedTokenAddress(
        nftMintPubkey,
        this.provider.wallet.publicKey!
      );

      // Get escrow SOL account (system account)
      const escrowSolAta = this.provider.wallet.publicKey!;

      // Get user's SOL account (system account)
      const userSolAta = this.provider.wallet.publicKey!;

      const [escrowAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from('escrow'), loanPubkey.toBuffer()],
        this.program.programId
      );

      const [config] = PublicKey.findProgramAddressSync(
        [Buffer.from('config'), this.provider.wallet.publicKey!.toBuffer()],
        this.program.programId
      );

      const tx = await this.program.methods
        .repayBorrower()
        .accounts({
          loan: loanPubkey,
          escrowAuthority,
          escrowNftAta,
          userNftAta,
          escrowSolAta,
          userSolAta,
          config,
          user: this.provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
      
      console.log('Repay transaction:', tx);
      return tx;
    } catch (error) {
      console.error('Repay error:', error);
      throw error;
    }
  }

  async getLoan(loanAddress: PublicKey): Promise<Loan> {
    try {
      return await this.program.account.loan.fetch(loanAddress);
    } catch (error) {
      console.error('Get loan error:', error);
      throw error;
    }
  }

  async getConfig(configAddress: PublicKey): Promise<Config> {
    try {
      return await this.program.account.config.fetch(configAddress);
    } catch (error) {
      console.error('Get config error:', error);
      throw error;
    }
  }

  async getAllLoans(): Promise<any[]> {
    try {
      const loans = await this.program.account.loan.all();
      return loans;
    } catch (error) {
      console.error('Get all loans error:', error);
      return [];
    }
  }
} 
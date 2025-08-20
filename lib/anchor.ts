import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

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

  constructor(wallet: any) {
    this.connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    this.provider = new AnchorProvider(this.connection, wallet, {
      commitment: 'confirmed',
    });
    // Initialize with a placeholder - will be set up properly when needed
    this.program = {
      methods: {},
      account: {},
      programId: PROGRAM_ID,
    };
  }

  async initialize(loanAmount: number) {
    const [config] = PublicKey.findProgramAddressSync(
      [Buffer.from('config'), this.provider.wallet.publicKey.toBuffer()],
      this.program.programId
    );

    return await this.program.methods
      .initialize(new BN(loanAmount))
      .accounts({
        config,
        admin: this.provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
  }

  async deposit(nftMint: PublicKey, userAta: PublicKey, escrowAta: PublicKey) {
    const [loan] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('loan'),
        this.provider.wallet.publicKey.toBuffer(),
        nftMint.toBuffer(),
      ],
      this.program.programId
    );

    const [config] = PublicKey.findProgramAddressSync(
      [Buffer.from('config'), this.provider.wallet.publicKey.toBuffer()],
      this.program.programId
    );

    const [escrowAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), loan.toBuffer()],
      this.program.programId
    );

    return await this.program.methods
      .deposite()
      .accounts({
        loan,
        escrowAta,
        escrowAuthority,
        config,
        userAta,
        nftMint,
        user: this.provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
  }

  async lendBorrower(loan: PublicKey, escrowAta: PublicKey, userAta: PublicKey) {
    const [escrowAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), loan.toBuffer()],
      this.program.programId
    );

    const [config] = PublicKey.findProgramAddressSync(
      [Buffer.from('config'), this.provider.wallet.publicKey.toBuffer()],
      this.program.programId
    );

    return await this.program.methods
      .lendBorrower()
      .accounts({
        loan,
        escrowAuthority,
        escrowAta,
        userAta,
        config,
        user: this.provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
  }

  async repayBorrower(
    loan: PublicKey,
    escrowNftAta: PublicKey,
    userNftAta: PublicKey,
    escrowSolAta: PublicKey,
    userSolAta: PublicKey
  ) {
    const [escrowAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), loan.toBuffer()],
      this.program.programId
    );

    const [config] = PublicKey.findProgramAddressSync(
      [Buffer.from('config'), this.provider.wallet.publicKey.toBuffer()],
      this.program.programId
    );

    return await this.program.methods
      .repayBorrower()
      .accounts({
        loan,
        escrowAuthority,
        escrowNftAta,
        userNftAta,
        escrowSolAta,
        userSolAta,
        config,
        user: this.provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  }

  async getLoan(loanAddress: PublicKey): Promise<Loan> {
    return await this.program.account.loan.fetch(loanAddress);
  }

  async getConfig(configAddress: PublicKey): Promise<Config> {
    return await this.program.account.config.fetch(configAddress);
  }
} 
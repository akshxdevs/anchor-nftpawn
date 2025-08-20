import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorNftpawn } from "../target/types/anchor_nftpawn";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";

describe("anchor-nftpawn", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.anchorNftpawn as Program<AnchorNftpawn>;
  const user = provider.wallet as anchor.Wallet;
  let amount = new anchor.BN(1_000_000_000);
  let userAta: anchor.web3.PublicKey;
  let config: anchor.web3.PublicKey;
  let escrowAuthority: anchor.web3.PublicKey;
  let escrowAta: anchor.web3.PublicKey;
  let loan: anchor.web3.PublicKey;
  let mint: anchor.web3.PublicKey;
  let solMint: anchor.web3.PublicKey;
  let escrowSolAta: anchor.web3.PublicKey;
  let userSolAta: anchor.web3.PublicKey;

  it("Is initialized!", async () => {
    [config] = await PublicKey.findProgramAddress(
      [Buffer.from("config"), user.publicKey.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .initialize(amount)
      .accounts({
        config: config,
        admin: user.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });

  it("Deposite from the user / Lend to the borrower", async () => {
    [config] = await PublicKey.findProgramAddress(
      [Buffer.from("config"), user.publicKey.toBuffer()],
      program.programId
    );

    mint = await createMint(
      provider.connection,
      user.payer,
      user.publicKey,
      null,
      0
    );

    [loan] = await PublicKey.findProgramAddress(
      [Buffer.from("loan"), user.publicKey.toBuffer(), mint.toBuffer()],
      program.programId
    );

    [escrowAuthority] = await PublicKey.findProgramAddress(
      [Buffer.from("escrow"), loan.toBuffer()],
      program.programId
    );

    escrowAta = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        user.payer,
        mint,
        escrowAuthority,
        true
      )
    ).address;

    userAta = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        user.payer,
        mint,
        user.publicKey
      )
    ).address;

    await mintTo(
      provider.connection,
      user.payer,
      mint,
      userAta,
      user.payer,
      2_000_000_000 // Mint 1 NFT
    );
    const userBalanceBefore = await provider.connection.getTokenAccountBalance(
      userAta
    );
    console.log("User balance before", userBalanceBefore.value.amount);
    const escrowBalanceBefore =
      await provider.connection.getTokenAccountBalance(escrowAta);
    console.log("Escrow balance before", escrowBalanceBefore.value.amount);
    const tx = await program.methods
      .deposite()
      .accounts({
        loan: loan,
        escrowAta: escrowAta,
        escrowAuthority: escrowAuthority,
        config: config,
        userAta: userAta,
        nftMint: mint,
        user: user.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("Your transaction signature", tx);
    const userBalanceAfter = await provider.connection.getTokenAccountBalance(
      userAta
    );
    const escrowBalanceAfter = await provider.connection.getTokenAccountBalance(
      escrowAta
    );
    console.log(
      "Deposit Results - User NFT:",
      userBalanceAfter.value.amount,
      "Escrow NFT:",
      escrowBalanceAfter.value.amount
    );
  });

  it("Lend to borrower", async () => {
    solMint = await createMint(
      provider.connection,
      user.payer,
      user.publicKey,
      null,
      9 // SOL has 9 decimals
    );

    escrowSolAta = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        user.payer,
        solMint,
        escrowAuthority,
        true
      )
    ).address;

    userSolAta = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        user.payer,
        solMint,
        user.publicKey
      )
    ).address;

    const escrowNftBalance = await provider.connection.getTokenAccountBalance(
      escrowAta
    );

    await mintTo(
      provider.connection,
      user.payer,
      solMint,
      escrowSolAta,
      user.payer,
      1_000_000_000 // 1 SOL
    );

    // Mint additional SOL to user for interest fee payment
    await mintTo(
      provider.connection,
      user.payer,
      solMint,
      userSolAta,
      user.payer,
      10_000_000
    );

    const escrowSolBalanceBefore =
      await provider.connection.getTokenAccountBalance(escrowSolAta);
    const userSolBalanceBefore =
      await provider.connection.getTokenAccountBalance(userSolAta);
    console.log(
      "Lend Setup - Escrow NFT:",
      escrowNftBalance.value.amount,
      "Escrow SOL:",
      Number(escrowSolBalanceBefore.value.amount) / 1_000_000_000 +
        " SOL, User SOL:",
      Number(userSolBalanceBefore.value.amount) / 1_000_000_000 + " SOL"
    );

    const tx = await program.methods
      .lendBorrower()
      .accounts({
        loan: loan,
        escrowAuthority: escrowAuthority,
        escrowAta: escrowSolAta,
        userAta: userSolAta,
        user: user.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("Lend transaction signature", tx);

    const escrowSolBalanceAfter =
      await provider.connection.getTokenAccountBalance(escrowSolAta);
    const userSolBalanceAfter =
      await provider.connection.getTokenAccountBalance(userSolAta);
    console.log(
      "Lend Results - Escrow SOL:",
      Number(escrowSolBalanceAfter.value.amount) / 1_000_000_000 +
        " SOL, User SOL:",
      Number(userSolBalanceAfter.value.amount) / 1_000_000_000 + " SOL"
    );
  });

  it("Repay to the lender", async () => {
    const escrowSolBalanceBefore =
      await provider.connection.getTokenAccountBalance(escrowSolAta);
    const userSolBalanceBefore =
      await provider.connection.getTokenAccountBalance(userSolAta);
    const escrowNftBalanceBefore =
      await provider.connection.getTokenAccountBalance(escrowAta);
    const userNftBalanceBefore =
      await provider.connection.getTokenAccountBalance(userAta);
    console.log(
      "Repay Setup - Escrow SOL:",
      Number(escrowSolBalanceBefore.value.amount) / 1_000_000_000 +
        " SOL, User SOL:",
      Number(userSolBalanceBefore.value.amount) / 1_000_000_000 +
        " SOL, Escrow NFT:",
      escrowNftBalanceBefore.value.amount,
      "User NFT:",
      userNftBalanceBefore.value.amount
    );

    const tx = await program.methods
      .repayBorrower()
      .accounts({
        loan: loan,
        escrowAuthority: escrowAuthority,
        escrowNftAta: escrowAta,
        userNftAta: userAta,
        escrowSolAta: escrowSolAta,
        userSolAta: userSolAta,
        config: config,
        user: user.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Repay transaction signature", tx);

    const escrowSolBalanceAfter =
      await provider.connection.getTokenAccountBalance(escrowSolAta);
    const userSolBalanceAfter =
      await provider.connection.getTokenAccountBalance(userSolAta);
    const escrowNftBalanceAfter =
      await provider.connection.getTokenAccountBalance(escrowAta);
    const userNftBalanceAfter =
      await provider.connection.getTokenAccountBalance(userAta);
    console.log(
      "Repay Results - Escrow SOL:",
      Number(escrowSolBalanceAfter.value.amount) / 1_000_000_000 +
        " SOL, User SOL:",
      Number(userSolBalanceAfter.value.amount) / 1_000_000_000 +
        " SOL, Escrow NFT:",
      escrowNftBalanceAfter.value.amount,
      "User NFT:",
      userNftBalanceAfter.value.amount
    );
  });
});

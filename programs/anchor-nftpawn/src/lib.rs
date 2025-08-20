use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Token},
};

declare_id!("GPCJ1xf8hidp64X5xRGUEdq171bgXoRVvBdLM7VNidoU");

#[program]
pub mod anchor_nftpawn {
    use super::*;
    use anchor_spl::token::Transfer;

    pub fn initialize(ctx: Context<Initialize>, loan_amount: u64) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.admin = ctx.accounts.admin.key();
        config.bump = ctx.bumps.config;
        config.loan_amount = loan_amount;
        config.bps_fee = 30;
        Ok(())
    }

    pub fn deposite(ctx: Context<Deposite>) -> Result<()> {
        let loan = &mut ctx.accounts.loan;
        require!(!loan.active, CustomError::LoanIsActive);

        // Transfer 1 NFT from user to escrow
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_ata.to_account_info(),
                    to: ctx.accounts.escrow_ata.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            1, // Transfer 1 NFT
        )?;
        loan.borrower = ctx.accounts.user.key();
        loan.nft_mint = ctx.accounts.nft_mint.key();
        loan.amount = ctx.accounts.config.loan_amount;
        loan.active = true;
        loan.bump = ctx.bumps.loan;

        Ok(())
    }

    pub fn lend_borrower(ctx: Context<LendBorrower>) -> Result<()> {
        let loan = &mut ctx.accounts.loan;
        require!(
            loan.borrower != Pubkey::default(),
            CustomError::BorrowerNotFound
        );
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_ata.to_account_info(),
                    to: ctx.accounts.user_ata.to_account_info(),
                    authority: ctx.accounts.escrow_authority.to_account_info(),
                },
                &[&[
                    b"escrow",
                    loan.to_account_info().key.as_ref(),
                    &[ctx.bumps.escrow_authority],                        
                ]],
            ),
            1_000_000_000, // Transfer 1 SOL
        )?;
        Ok(())
    }
    pub fn repay_borrower(ctx: Context<RepayBorrower>) -> Result<()> {  
        let loan = &mut ctx.accounts.loan;
        let fee = calc_fee(loan.amount, ctx.accounts.config.bps_fee)?;
        let total_repay_amount = loan.amount.checked_add(fee).ok_or(CustomError::MathOverflow)?;
        require!(loan.active, CustomError::LoanIsNotActive);
        
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_sol_ata.to_account_info(),
                    to: ctx.accounts.escrow_sol_ata.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            total_repay_amount,            
        )?;

        let escrow_seeds = &[
            b"escrow",
            loan.to_account_info().key.as_ref(),
            &[ctx.bumps.escrow_authority],
        ];
        let escrow_signer = &[&escrow_seeds[..]];
        
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_nft_ata.to_account_info(),
                    to: ctx.accounts.user_nft_ata.to_account_info(),
                    authority: ctx.accounts.escrow_authority.to_account_info(),
                },
                escrow_signer,
            ),
            1, // Transfer 1 NFT
        )?;
        loan.active = false;
        Ok(())
    }
}

#[account]
pub struct Config {
    pub admin: Pubkey,
    pub loan_amount: u64,
    pub bps_fee:u64,
    pub bump: u8,
}
impl Config {
    pub const SIZE: usize = 32 + 8 + 8 + 1;
}

#[account]
pub struct Loan {
    pub nft_mint: Pubkey,
    pub borrower: Pubkey,
    pub amount: u64,
    pub active: bool,
    pub bump: u8,
}
impl Loan {
    pub const SIZE: usize = 32 + 32 + 8 + 1 + 1;
}

#[account]
pub struct Escrow {
    pub owner: Pubkey,
    pub bump: u8,
}
impl Escrow {
    pub const SIZE: usize = 32 + 1;
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        seeds = [b"config",admin.key().as_ref()],
        payer = admin,
        space = 8 + Config::SIZE,
        bump,
    )]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposite<'info> {
    #[account(
        init,
        seeds = [b"loan", user.key().as_ref(), nft_mint.key().as_ref()],
        payer = user,
        space = 8 + Loan::SIZE,
        bump
    )]
    pub loan: Account<'info, Loan>,

    /// CHECK: PDA token account for escrow
    #[account(mut)]
    pub escrow_ata: AccountInfo<'info>,

    #[account(
        seeds = [b"escrow", loan.key().as_ref()],
        bump
    )]
    /// CHECK: PDA authority for escrow ATA
    pub escrow_authority: UncheckedAccount<'info>,

    #[account(mut)]
    pub config: Account<'info, Config>,

    /// CHECK: User's token account containing the NFT
    #[account(mut)]
    pub user_ata: AccountInfo<'info>,

    /// CHECK: NFT mint
    #[account(mut)]
    pub nft_mint: AccountInfo<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LendBorrower<'info> {
    #[account(mut)]
    pub loan: Account<'info, Loan>,
    #[account(
        init,
        seeds = [b"escrow",loan.key().as_ref()],
        payer = user,
        space = 8 + Escrow::SIZE,
        bump
    )]
    /// CHECK: PDA authority for escrow ATA
    pub escrow_authority: Account<'info, Escrow>,
    /// CHECK: PDA token account for escrow
    #[account(mut)]
    pub escrow_ata: AccountInfo<'info>,
    /// CHECK: User's token account containing the NFT
    #[account(mut)]
    pub user_ata: AccountInfo<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RepayBorrower<'info> {
    #[account(mut)]
    pub loan: Account<'info, Loan>,
    #[account(
        mut,
        seeds = [b"escrow",loan.key().as_ref()],
        bump
    )]    /// CHECK: PDA authority for escrow ATA
    pub escrow_authority: Account<'info, Escrow>,
    /// CHECK: Escrow NFT token account
    #[account(mut)]
    pub escrow_nft_ata: AccountInfo<'info>,
    /// CHECK: User's NFT token account
    #[account(mut)]
    pub user_nft_ata: AccountInfo<'info>,
    /// CHECK: Escrow SOL token account
    #[account(mut)]
    pub escrow_sol_ata: AccountInfo<'info>,
    /// CHECK: User's SOL token account
    #[account(mut)]
    pub user_sol_ata: AccountInfo<'info>,   
    #[account(mut)]
    pub config:Account<'info,Config>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum CustomError {
    #[msg("Loan is active somewhere..")]
    LoanIsActive,
    #[msg("Borrower not found or not provided..")]
    BorrowerNotFound,
    #[msg("Loan is not active..")]
    LoanIsNotActive,
    #[msg("Math overflow")]
    MathOverflow,
}
fn calc_fee(amount: u64, fee_bps: u64) -> Result<u64> {
    let fee = amount
        .checked_mul(fee_bps as u64)
        .ok_or(CustomError::MathOverflow)?
        .checked_div(10000)
        .ok_or(CustomError::MathOverflow)?;
    Ok(fee)
}
use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("REPLACE_WITH_YOUR_GENERATED_PROGRAM_ID");

#[program]
pub mod stocksplit {
    use super::*;

    // Create user's real on-chain position
    pub fn initialize_position(
        ctx: Context<InitializePosition>,
    ) -> Result<()> {
        let position = &mut ctx.accounts.position;

        position.owner = ctx.accounts.user.key();
        position.collateral_lamports = 0;
        position.borrowed_lamports = 0;
        position.bump = ctx.bumps.position;

        Ok(())
    }

    // REAL SOL DEPOSIT
    pub fn deposit_collateral(
        ctx: Context<DepositCollateral>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, StockSplitError::InvalidAmount);

        // Actual SOL transfer:
        // User Wallet → Vault PDA
        let cpi_accounts = system_program::Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        };

        let cpi_context =
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                cpi_accounts,
            );

        system_program::transfer(
            cpi_context,
            amount,
        )?;

        // Record actual deposited amount
        let position = &mut ctx.accounts.position;

        position.collateral_lamports = position
            .collateral_lamports
            .checked_add(amount)
            .ok_or(StockSplitError::MathOverflow)?;

        Ok(())
    }

    // REPAY DEBT
    pub fn repay(
        ctx: Context<UpdatePosition>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, StockSplitError::InvalidAmount);

        let position = &mut ctx.accounts.position;

        require!(
            amount <= position.borrowed_lamports,
            StockSplitError::RepayAmountTooHigh
        );

        position.borrowed_lamports = position
            .borrowed_lamports
            .checked_sub(amount)
            .ok_or(StockSplitError::MathOverflow)?;

        Ok(())
    }
}


// =============================================
// INITIALIZE POSITION
// =============================================

#[derive(Accounts)]
pub struct InitializePosition<'info> {

    #[account(
        init,
        payer = user,
        space = 8 + Position::INIT_SPACE,
        seeds = [
            b"position",
            user.key().as_ref()
        ],
        bump
    )]
    pub position: Account<'info, Position>,

    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: SystemAccount<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program:
        Program<'info, System>,
}


// =============================================
// DEPOSIT
// =============================================

#[derive(Accounts)]
pub struct DepositCollateral<'info> {

    #[account(
        mut,
        seeds = [
            b"position",
            user.key().as_ref()
        ],
        bump = position.bump,
        constraint =
            position.owner == user.key()
                @ StockSplitError::Unauthorized
    )]
    pub position: Account<'info, Position>,

    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: SystemAccount<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program:
        Program<'info, System>,
}


// =============================================
// UPDATE POSITION
// =============================================

#[derive(Accounts)]
pub struct UpdatePosition<'info> {

    #[account(
        mut,
        seeds = [
            b"position",
            user.key().as_ref()
        ],
        bump = position.bump,
        constraint =
            position.owner == user.key()
                @ StockSplitError::Unauthorized
    )]
    pub position: Account<'info, Position>,

    pub user: Signer<'info>,
}


// =============================================
// POSITION DATA
// =============================================

#[account]
#[derive(InitSpace)]
pub struct Position {

    pub owner: Pubkey,

    // Actual SOL deposited
    pub collateral_lamports: u64,

    // Future real debt amount
    pub borrowed_lamports: u64,

    pub bump: u8,
}


// =============================================
// ERRORS
// =============================================

#[error_code]
pub enum StockSplitError {

    #[msg("Amount must be greater than zero")]
    InvalidAmount,

    #[msg("Math overflow")]
    MathOverflow,

    #[msg("Unauthorized")]
    Unauthorized,

    #[msg("Repay amount is greater than borrowed amount")]
    RepayAmountTooHigh,
}

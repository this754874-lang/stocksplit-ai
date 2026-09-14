use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod stocksplit {
    use super::*;

    // Create a real on-chain user position
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

    // Record collateral in the user's on-chain position
    pub fn deposit_collateral(
        ctx: Context<UpdatePosition>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, StockSplitError::InvalidAmount);

        let position = &mut ctx.accounts.position;

        position.collateral_lamports = position
            .collateral_lamports
            .checked_add(amount)
            .ok_or(StockSplitError::MathOverflow)?;

        Ok(())
    }

    // Borrow test units against collateral
    pub fn borrow(
        ctx: Context<UpdatePosition>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, StockSplitError::InvalidAmount);

        let position = &mut ctx.accounts.position;

        let max_borrow = position.collateral_lamports
            .checked_div(2)
            .ok_or(StockSplitError::MathOverflow)?;

        let new_borrowed = position.borrowed_lamports
            .checked_add(amount)
            .ok_or(StockSplitError::MathOverflow)?;

        require!(
            new_borrowed <= max_borrow,
            StockSplitError::InsufficientCollateral
        );

        position.borrowed_lamports = new_borrowed;

        Ok(())
    }

    // Repay borrowed test units
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


// ============================================
// ACCOUNTS
// ============================================

#[derive(Accounts)]
pub struct InitializePosition<'info> {

    #[account(
        init,
        payer = user,
        space = 8 + Position::INIT_SPACE,
        seeds = [b"position", user.key().as_ref()],
        bump
    )]
    pub position: Account<'info, Position>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct UpdatePosition<'info> {

    #[account(
        mut,
        seeds = [b"position", user.key().as_ref()],
        bump = position.bump,
        has_one = owner
    )]
    pub position: Account<'info, Position>,

    pub owner: UncheckedAccount<'info>,

    pub user: Signer<'info>,
}


// ============================================
// POSITION ACCOUNT
// ============================================

#[account]
#[derive(InitSpace)]
pub struct Position {

    pub owner: Pubkey,

    // Actual values stored on-chain
    pub collateral_lamports: u64,

    pub borrowed_lamports: u64,

    pub bump: u8,
}


// ============================================
// ERRORS
// ============================================

#[error_code]
pub enum StockSplitError {

    #[msg("Amount must be greater than zero")]
    InvalidAmount,

    #[msg("Math overflow")]
    MathOverflow,

    #[msg("Insufficient collateral")]
    InsufficientCollateral,

    #[msg("Repay amount is greater than borrowed amount")]
    RepayAmountTooHigh,
  }

#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("FPzzmxm38cjWpiCQzHwF1Gb6stPPxGXGqiA6RZ8WAGNn");

#[program]
pub mod votingdapp {
    use super::*;

    /// Initializes the election with a name, description, start time, and candidates.
    pub fn initialize_election(
        ctx: Context<InitializeElection>,
        name: String,
        description: String,
        start_time: u64,
        end_time: u64,
        candidate_names: Vec<String>,
    ) -> Result<()> {
        let election = &mut ctx.accounts.election;

        // Ensure election is not already initialized
        if election.initialized {
            return Err(ErrorCode::ElectionAlreadyInitialized.into());
        }

        election.name = name;
        election.description = description;
        election.start_time = start_time;
        election.end_time = end_time;
        election.admin = ctx.accounts.admin.key(); // Assign admin role

        for (index, candidate_name) in candidate_names.into_iter().enumerate() {
            election.candidates.push(Candidate {
                id: index as u16,
                name: candidate_name,
                voters: [].to_vec(),
            });
        }

        election.initialized = true;
        msg!("Election initialized: {}", election.name);
        Ok(())
    }

    /// Casts a vote for a candidate by ID.
    pub fn vote(ctx: Context<Vote>, candidate_id: u16) -> Result<()> {
        let election = &mut ctx.accounts.election;

        // Get the current time from the Solana Clock
        let current_time = Clock::get()?.unix_timestamp;

        // Validate voting period
        if current_time < (election.start_time as i64) {
            return Err(ErrorCode::VotingNotStarted.into());
        }
        if current_time > (election.end_time as i64) {
            return Err(ErrorCode::VotingEnded.into());
        }

        // Check if the user has already voted
        if election.voters.contains(&ctx.accounts.signer.key()) {
            return Err(ErrorCode::AlreadyVoted.into());
        }

        if let Some(candidate) = election
            .candidates
            .iter_mut()
            .find(|c: &&mut Candidate| c.id == candidate_id)
        {
            candidate.voters.push(ctx.accounts.signer.key())
        } else {
            return Err(ErrorCode::CandidateNotFound.into());
        }

        // Add the user to the voters list
        election.voters.push(ctx.accounts.signer.key());

        msg!("Vote cast for candidate ID: {}", candidate_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeElection<'info> {
    /// The signer who will become the admin of the election.
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + Election::INIT_SPACE,
        seeds = [b"election".as_ref()],
        bump
    )]
    pub election: Account<'info, Election>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"election"],
        bump,
    )]
    pub election: Account<'info, Election>,
}

#[account]
pub struct Election {
    pub initialized: bool,          // Marks if the election has been initialized
    pub admin: Pubkey,              // Admin's public key
    pub name: String,               // Name of the election
    pub description: String,        // Description of the election
    pub start_time: u64,            // Voting start time
    pub end_time: u64,              // Voting end time
    pub candidates: Vec<Candidate>, // List of candidates
    pub voters: Vec<Pubkey>,        // List of voters who have voted
}

impl Election {
    pub const INIT_SPACE: usize = 1 // `initialized`
        + 32 // `admin` (Pubkey)
        + 64 // `name` (arbitrary length, adjust as needed)
        + 256 // `description` (arbitrary length, adjust as needed)
        + 16 // `start_time` and `end_time`
        + (8 + Candidate::INIT_SPACE * 10) // 10 candidates max
        + (4 + 32 * 100); // 100 voters max
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Candidate {
    pub id: u16,
    pub name: String,
    pub voters: Vec<Pubkey>,
}

impl Candidate {
    pub const INIT_SPACE: usize = 2 // `id`
        + 64 // `name` (arbitrary length, adjust as needed)
        + 4; // `votes`
}

#[error_code]
pub enum ErrorCode {
    #[msg("Election has already been initialized.")]
    ElectionAlreadyInitialized,
    #[msg("Voting has not started yet.")]
    VotingNotStarted,
    #[msg("Voting has ended.")]
    VotingEnded,
    #[msg("Candidate not found.")]
    CandidateNotFound,
    #[msg("Unauthorized admin action.")]
    UnauthorizedAdmin,
    #[msg("You have already voted.")]
    AlreadyVoted,
}

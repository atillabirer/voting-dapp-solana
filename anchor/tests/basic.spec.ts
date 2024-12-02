import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Votingdapp } from '../target/types/votingdapp';
import { PublicKey } from '@solana/web3.js';
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

describe("voting-dapp", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.Votingdapp as Program<Votingdapp>;
    // const baseAccount = anchor.web3.Keypair.generate();
    let electionAddress: PublicKey;
    beforeAll(async () => {
        // This may be needed later
        // const airdropSignature = await program.provider.connection.requestAirdrop(
        //     baseAccount.publicKey,
        //     1 * LAMPORTS_PER_SOL
        // );

        // const latestBlockHash = await program.provider.connection.getLatestBlockhash();

        // await program.provider.connection.confirmTransaction({
        //     blockhash: latestBlockHash.blockhash,
        //     lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        //     signature: airdropSignature,
        // });

        [electionAddress] = PublicKey.findProgramAddressSync(
            [Buffer.from("election")],
            program.programId
        );
    });


    it('initialize election', async () => {
        const ELECTION_NAME: string = "test election"
        const ELECTION_DESCRIPTION: string = "welcome to test election"
        const ELECTION_START_TIME: anchor.BN =
            new anchor.BN(Math.floor(Date.now() / 1000));
        const ELECTION_END_TIME: anchor.BN =
            new anchor.BN(Math.floor(Date.now() / 1000) + 100);
        const ELECTION_CANDIDATES = ['cand1', 'cand2', 'cand3', 'cand4']

        await program.methods.initializeElection(
            ELECTION_NAME,
            ELECTION_DESCRIPTION,
            ELECTION_START_TIME,
            ELECTION_END_TIME,
            ELECTION_CANDIDATES,
        ).rpc();

        // Delay to make sure the time modifies a bit
        await new Promise(resolve => setTimeout(resolve, 1000));

        const electionAcc = await program.account.election.fetch(electionAddress);
        expect(electionAcc.name).toBe(ELECTION_NAME)
        expect(electionAcc.description).toBe(ELECTION_DESCRIPTION)
        const now: anchor.BN = new anchor.BN(Math.floor(Date.now() / 1000));
        expect(electionAcc.startTime.toNumber()).toBeLessThan(now.toNumber())
        expect(electionAcc.endTime.toNumber()).toBeGreaterThan(now.toNumber())

        expect(electionAcc.candidates.length).toBe(4)
        expect(electionAcc.candidates[0].id).toBe(0)
        expect(electionAcc.candidates[0].name).toBe(ELECTION_CANDIDATES[0])
    });

    it('casts a vote for a candidate', async () => {
        const candidateId = 1;

        await program.methods
            .vote(candidateId)
            .accounts({
                signer: provider.wallet.publicKey,
            })
            .rpc();

        // Fetch updated election account
        const election = await program.account.election.fetch(electionAddress);

        const candidate = election.candidates.find((c) => c.id === candidateId)!;
        expect(candidate.voters.length).toBe(1);
    });

    it("prevents multiple votes by the same user", async () => {
        const candidateId = 1;
        try {
            await program.methods
                .vote(candidateId)
                .accounts({
                    signer: provider.wallet.publicKey,
                })
                .rpc();
        } catch (err) {
            const { code } = (err as anchor.AnchorError).error.errorCode;
            expect(code).toBe('AlreadyVoted')
        }
    });

    it("allows a new user to vote it", async () => {
        const baseAccount = anchor.web3.Keypair.generate();
        const candidateId = 1;

        await program.methods
            .vote(candidateId)
            .accounts({
                signer: baseAccount.publicKey,
            }).signers([baseAccount])
            .rpc();

        const election = await program.account.election.fetch(electionAddress);
        const candidate = election.candidates.find((c) => c.id === candidateId)!;
        expect(candidate.voters.length).toBe(2);
    })

    it("simulates a election", async () => {
        const candidate_2_prev_votes = 2

        const candidate_1_votes = 1
        const candidate_2_votes = 3
        const candidate_3_votes = 5
        const candidate_4_votes = 9

        for (let i = 0; i < candidate_1_votes; i++) {
            const newAccount = anchor.web3.Keypair.generate();
            await program.methods
                .vote(0)
                .accounts({
                    signer: newAccount.publicKey,
                }).signers([newAccount])
                .rpc();
        }

        for (let i = 0; i < candidate_2_votes; i++) {
            const newAccount = anchor.web3.Keypair.generate();
            await program.methods
                .vote(1)
                .accounts({
                    signer: newAccount.publicKey,
                }).signers([newAccount])
                .rpc();
        }

        for (let i = 0; i < candidate_3_votes; i++) {
            const newAccount = anchor.web3.Keypair.generate();
            await program.methods
                .vote(2)
                .accounts({
                    signer: newAccount.publicKey,
                }).signers([newAccount])
                .rpc();
        }

        for (let i = 0; i < candidate_4_votes; i++) {
            const newAccount = anchor.web3.Keypair.generate();
            await program.methods
                .vote(3)
                .accounts({
                    signer: newAccount.publicKey,
                }).signers([newAccount])
                .rpc();
        }


        const election = await program.account.election.fetch(electionAddress);
        const candidate_1_registered_votes = election.candidates.find((c) => c.id === 0)!;
        const candidate_2_registered_votes = election.candidates.find((c) => c.id === 1)!;
        const candidate_3_registered_votes = election.candidates.find((c) => c.id === 2)!;
        const candidate_4_registered_votes = election.candidates.find((c) => c.id === 3)!;

        expect(candidate_1_registered_votes.voters.length).toBe(candidate_1_votes)
        expect(candidate_2_registered_votes.voters.length).toBe(candidate_2_votes + candidate_2_prev_votes)
        expect(candidate_3_registered_votes.voters.length).toBe(candidate_3_votes)
        expect(candidate_4_registered_votes.voters.length).toBe(candidate_4_votes)

    }, 15000)
});
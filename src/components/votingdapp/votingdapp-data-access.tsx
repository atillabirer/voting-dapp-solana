import { useConnection } from '@solana/wallet-adapter-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { getVotingdappProgram, getVotingdappProgramId } from '@project/anchor'
import { useTransactionToast } from '../ui/ui-layout'
import toast from 'react-hot-toast'
import * as anchor from '@coral-xyz/anchor';

export function useVotingdappProgram() {
    const { connection } = useConnection()
    const { cluster } = useCluster()
    const provider = useAnchorProvider()
    const programId = useMemo(() => getVotingdappProgramId(cluster.network as Cluster), [cluster])
    const program = getVotingdappProgram(provider)
    const transactionToast = useTransactionToast()

    const initialize = useMutation({
        mutationKey: ['votingdapp', 'initialize-election', { cluster }],
        mutationFn: () => {
            const ELECTION_NAME: string = "Presidential Election 2025"
            const ELECTION_DESCRIPTION: string = "Welcome to presidential election of 2025"
            const ELECTION_START_TIME: anchor.BN =
                new anchor.BN(Math.floor(Date.now() / 1000));
            const ELECTION_END_TIME: anchor.BN =
                new anchor.BN(Math.floor(Date.now() / 1000) + 100);
            const ELECTION_CANDIDATES = [
                'Matthew Johnson',
                'Abraham Majaalak',
                'Tudor Sandu',
                'Dan Hanel'
            ]

            return program.methods.initializeElection(
                ELECTION_NAME,
                ELECTION_DESCRIPTION,
                ELECTION_START_TIME,
                ELECTION_END_TIME,
                ELECTION_CANDIDATES,
            ).rpc();
        },
        onSuccess: (signature) => {
            transactionToast(signature)
            return accounts.refetch()
        },
        onError: (err) => toast.error(`Failed to initialize', ${err.message}`),
    })

    const accounts = useQuery({
        queryKey: ['votingdapp', 'all', { cluster }],
        queryFn: () => program.account.election.all(),
    })

    const getProgramAccount = useQuery({
        queryKey: ['get-program-account', { cluster }],
        queryFn: () => connection.getParsedAccountInfo(programId),
    })

    return {
        initialize,
        program,
        programId,
        accounts,
        getProgramAccount,
    }
}

export function useVotingdapprogramAccount({ account }: { account: PublicKey }) {
    const { cluster } = useCluster()
    const transactionToast = useTransactionToast()
    const { program, accounts } = useVotingdappProgram()

    const accountQuery = useQuery({
        queryKey: ['votingdapp', 'fetch', { cluster, account }],
        queryFn: () => program.account.election.fetch(account),
    })


    const vote = useMutation({
        mutationKey: ['votingdapp', 'vote', { cluster }],
        mutationFn: ({ candidateId, signerKey }: any) => {
            return program.methods
                .vote(candidateId)
                .accounts({
                    signer: signerKey
                }).rpc()
        },
        onSuccess: (signature) => {
            transactionToast(`Your vote has been succesfully casted ${signature}`)
            return accounts.refetch()
        },
        onError: (error) => {
            toast.error(`Your vote has not been casted: ${error.message}`);
        },
    })


    return {
        accountQuery,
        vote
    }
}

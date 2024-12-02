import { Keypair, PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import { ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useVotingdappProgram, useVotingdapprogramAccount } from './votingdapp-data-access'
import Image from 'next/image'

export function VotingDappSystemCreate() {
    const { initialize } = useVotingdappProgram()

    return (
        <button
            className="btn btn-xs lg:btn-md btn-primary"
            onClick={() => initialize.mutateAsync()}
            disabled={initialize.isPending}
        >
            Initialize {initialize.isPending && '...'}
        </button>
    )
}

export function VotingdappList() {
    const { accounts, getProgramAccount } = useVotingdappProgram()

    if (getProgramAccount.isLoading) {
        return <span className="loading loading-spinner loading-lg"></span>
    }
    if (!getProgramAccount.data?.value) {
        return (
            <div className="alert alert-info flex justify-center">
                <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
            </div>
        )
    }

    return (
        <div className={'space-y-6 min-h-screen flex items-center justify-center'}>
            {accounts.isLoading ? (
                <span className="loading loading-spinner loading-lg"></span>
            ) : accounts.data?.length ? (
                <div className="grid gap-6 md:grid-cols-3">
                    {accounts.data?.map(
                        (account) => (
                            <BlockchainVotingSystemCard
                                key={account.publicKey.toString()}
                                account={account.publicKey}
                                candidates={account.account?.candidates}
                            />
                        ))}
                </div>
            ) : (
                <div className="text-center">
                    <h2 className={'text-2xl'}>No accounts</h2>
                    No accounts found. Create one above to get started.
                </div>
            )}
        </div>
    )
}

type Candidate = {
    id: number,
    name: string,
    voters: any[]
}

function BlockchainVotingSystemCard({ account, candidates }: { account: PublicKey, candidates: Candidate[] }) {
    const { accountQuery, vote } = useVotingdapprogramAccount({
        account
    })

    const ListCandidates = candidates.map((candidate) =>
        <div key={candidate.id.toString()} className="card bg-base-300 w-96 shadow-2xl mb-6">
            <figure className="px-10 pt-10">
                <Image
                    width={400}
                    height={300}
                    src="https://via.placeholder.com/400x300"
                    alt="Shoes"
                    className="rounded-xl" />
            </figure>
            <div className="card-body items-center text-center">
                <h2 className="card-title">{candidate.name}</h2>
                <p className='mb-2'>{"Temporary descriptions"}</p>
                <div className="card-actions w-full">
                    <button
                        className="btn btn-primary w-full"
                        onClick={() => vote.mutateAsync(candidate.id)}>
                        Vote
                    </button>
                </div>
            </div>
        </div>
    )

    const candidatesMemo = useMemo(() => accountQuery.data?.candidates ?? 0, [accountQuery.data?.candidates])

    return accountQuery.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
    ) : (
        ListCandidates
    )
}

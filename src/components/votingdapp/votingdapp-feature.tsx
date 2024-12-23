'use client'
import { useWallet } from '@solana/wallet-adapter-react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { AppHero, ellipsify } from '../ui/ui-layout'
import { useVotingdappProgram } from './votingdapp-data-access'
import { VotingDappSystemCreate, VotingdappList } from './votingdapp-ui'
import { WalletButton } from '../solana/solana-provider'
import getUnixInDate from '@/utils/getUnixInDate'

export default function VotingdappSystemFeature() {
    const { publicKey } = useWallet()
    const { accounts, programId } = useVotingdappProgram()

    const title = accounts.data && accounts.data.length ? accounts.data[0].account?.name : "Unintialized Blockchain Presidental Election"
    const subtitle = accounts.data && accounts.data.length ? `${accounts.data[0].account?.description}` : "No description yet"
    const start_time = accounts.data && accounts.data.length ? `${getUnixInDate(accounts.data[0].account?.startTime.toNumber())}` : "No data"
    const end_time = accounts.data && accounts.data.length ? `${getUnixInDate(accounts.data[0].account?.endTime.toNumber())}` : "No data"

    return publicKey ? (
        <div>
            <AppHero
                title={title}
                subtitle={subtitle}
            >
                <p className='mb-3'>
                    Election starts: {start_time}<br />
                    Election ends: {end_time}
                </p>
                <p className="mb-6">
                    <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
                </p>
                <VotingDappSystemCreate />
            </AppHero>
            <VotingdappList />
        </div>
    ) : (
        <div className="max-w-4xl mx-auto">
            <div className="hero py-[64px]">
                <div className="hero-content text-center">
                    <WalletButton />
                </div>
            </div>
        </div>
    )
}

import { useVotingdappProgram } from "../votingdapp/votingdapp-data-access";

export function useCandidateScores() {
    const { accounts } = useVotingdappProgram()
    const candidates = accounts.data && accounts.data.length && accounts.data[0].account.candidates
    if (!candidates) return

    let total_votes: number = 0
    candidates.forEach((cand) => {
        total_votes += cand.voters.length
    })

    const scores: any[] = []

    candidates.map((cand) => {
        scores.push({
            label: cand.name,
            value: calculatePercentage(cand.voters.length, total_votes)
        })
    })

    return scores
}

const calculatePercentage = (part: number, whole: number) => {
    return ((part / whole) * 100).toFixed(2);
}

// export const desktopOS = [
//     {
//         label: 'Windows',
//         value: 72.72,
//     },
//     {
//         label: 'OS X',
//         value: 16.38,
//     },
//     {
//         label: 'Linux',
//         value: 3.83,
//     },
//     {
//         label: 'Chrome OS',
//         value: 2.42,
//     },
//     {
//         label: 'Other',
//         value: 4.65,
//     },
// ];


// export const mobileOS = [
//     {
//         label: 'Android',
//         value: 70.48,
//     },
//     {
//         label: 'iOS',
//         value: 28.8,
//     },
//     {
//         label: 'Other',
//         value: 0.71,
//     },
// ];

// export const platforms = [
//     {
//         label: 'Mobile',
//         value: 59.12,
//     },
//     {
//         label: 'Desktop',
//         value: 40.88,
//     },
// ];



// const normalize = (v: number, v2: number) => Number.parseFloat(((v * v2) / 100).toFixed(2));

// export const mobileAndDesktopOS = [
//     ...mobileOS.map((v) => ({
//         ...v,
//         label: v.label === 'Other' ? 'Other (Mobile)' : v.label,
//         value: normalize(v.value, platforms[0].value),
//     })),
//     ...desktopOS.map((v) => ({
//         ...v,
//         label: v.label === 'Other' ? 'Other (Desktop)' : v.label,
//         value: normalize(v.value, platforms[1].value),
//     })),
// ];

export const valueFormatter = (item: { value: number }) => `${item.value}%`;
export default function getUnixInDate(timestamp: number) {
    return new Date(timestamp * 1000)
}
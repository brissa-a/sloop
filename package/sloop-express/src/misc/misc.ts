
export function discardId<T extends { id: any } | undefined | null>(obj: T): Omit<T, 'id'> {
    if (!obj) return obj
    const clone = { ...obj }
    delete clone.id
    return clone
}

export function printProgress(progress: number, total: number, message: string) {
    if (process.stdout.isTTY === true) {
        process.stdout.clearLine(0)
        process.stdout.cursorTo(0)
    }
    process.stdout.write(`${progress}/${total} ${message}`)
}

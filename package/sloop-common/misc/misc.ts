export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export const _throw = (message: string) => {
    throw new Error(message)
}


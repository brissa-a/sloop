import _ from "lodash";

export function keyBy<T>(items: T[], key: keyof T): Record<string, T> {
    return _.keyBy(items, key);
}

export function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const a = newArray[i]
        const b = newArray[j]
        if (a === undefined || b === undefined) throw new Error('undefined');
        [newArray[i], newArray[j]] = [b, a];
    }
    return newArray;
}

export function chunkArray<T>(array: T[], size: number): T[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

export function pickRandomSizeSlice<T>(array: T[], minSize: number, maxSize: number): T[] {
    const size = Math.floor(Math.random() * (maxSize - minSize)) + minSize;
    const startIndex = Math.floor(Math.random() * (array.length - size));
    return array.slice(startIndex, startIndex + size);
}
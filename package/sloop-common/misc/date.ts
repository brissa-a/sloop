import ms from "ms";

export const ago = (durationStr: string): Date => {
    const now = new Date();
    return new Date(now.getTime() - ms(durationStr));
};
import { z } from "zod";

export const dateFromIsoString = () => z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
    }
}, z.date());

export const commonlyFilledByBackend = {
    id: true,
    createdAt: true,
    createdById: true,
    updatedAt: true
} as const
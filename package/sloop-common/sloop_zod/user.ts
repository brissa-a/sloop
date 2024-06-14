import { z } from "zod";

export const LoginSchema = z.object({
    id: z.string(),
    password: z.string(),
    keepMeLoggedIn: z.boolean().optional(),
    forwardAdmin: z.boolean().optional(),
})
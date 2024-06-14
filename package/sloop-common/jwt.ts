import { ConfidentialUserSchema, UserSchema } from "./prisma_zod";
import { z } from "zod";

export const UserJwtPayloadSchema = UserSchema.pick({
    id: true,
    email: true,
    slug: true,
    username: true,
    avatarUrl: true,
    isAdmin: true,
}).merge(z.object({
    groupMembership: z.array(z.object({ role: z.string(), group: z.object({ slug: z.string(), id: z.string() }) })),
    confidential: ConfidentialUserSchema.nullable(),
}))

export type UserJwtPayload = z.infer<typeof UserJwtPayloadSchema>

export const SloopOnlyJwtPayloadSchema = z.object({
    principal: UserJwtPayloadSchema,
    user: UserJwtPayloadSchema,
    isAdmin: z.boolean(),
    sessionId: z.string(),
})

export type SloopOnlyJwtPayload = z.infer<typeof SloopOnlyJwtPayloadSchema>

export const StandardJwtPayloadSchema = z.object({
    iss: z.string().nullish(),
    sub: z.string().nullish(),
    aud: z.string().nullish().or(z.array(z.string())),
    exp: z.number().nullish(),
    nbf: z.number().nullish(),
    iat: z.number().nullish(),
    jti: z.string().nullish(),
})

export type StandardJwtPayload = z.infer<typeof StandardJwtPayloadSchema>

export const SloopJwtPayloadSchema = SloopOnlyJwtPayloadSchema.merge(StandardJwtPayloadSchema)
export type SloopJwtPayload = z.infer<typeof SloopJwtPayloadSchema>
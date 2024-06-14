import { VotingSchema } from '@sloop-common/prisma_zod';
import { z } from 'zod';
import { commonlyFilledByBackend } from '../misc';
import slugify from 'slugify';


export const CreateVotingSchema = VotingSchema.omit({
    ...commonlyFilledByBackend,
    endedBySessionId: true,
    startedBySessionId: true,
    actualEndAt: true,
    actualStartAt: true,
}).extend({
    startImmediately: z.boolean(),
    choices: z.array(z.string()),
    proposalId: z.string().optional().transform(value => value || null).nullable(),
}).extend({
    slug: z.string().refine(slug => slug === slugify(slug, { lower: true, strict: true }), { message: 'Slug invalide' })
})


export const DoVoteSchema = z.object({
    votingId: z.string(),
    votes: z.array(z.object({
        scores: z.array(z.object({
            forChoiceId: z.string(),
            score: z.string()
        })),
        copiedId: z.string().nullable(),
        power: z.number(),
    })),
})

export const StartVotingSchema = z.object({
    votingId: z.string(),
})

export const EndVotingSchema = z.object({
    votingId: z.string(),
})
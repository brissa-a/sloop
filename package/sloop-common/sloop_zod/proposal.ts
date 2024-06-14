import { ProposalSchema } from "@sloop-common/prisma_zod";
import { commonlyFilledByBackend } from "./misc";
import { z } from "zod";
import slugify from "slugify";


export const CreateProposalSchema = ProposalSchema.omit({
    ...commonlyFilledByBackend,
    publishedAt: true,
    archivedAt: true,
    content: true,
    authorId: true,
}).extend({
    slug: z.string().refine(slug => slug === slugify(slug, { lower: true, strict: true }), { message: 'Slug invalide' })
})

export const PublishProposalSchema = z.object({
    proposalId: z.string()
})

export const ArchiveProposalSchema = z.object({
    proposalId: z.string()
})

export const UpdateProposalSchema = z.object({
    proposalId: z.string(),
    update: ProposalSchema.omit({
        ...commonlyFilledByBackend,
        publishedAt: true,
        archivedAt: true,
        description: true,
        authorId: true,
        groupId: true,
    }).extend({
        slug: z.string().refine(slug => slug === slugify(slug, { lower: true, strict: true }), { message: 'Slug invalide' })
    }).partial()

})
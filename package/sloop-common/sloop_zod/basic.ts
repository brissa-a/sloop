import { ProposalSchema } from "@sloop-common/prisma_zod";

export const CreateBasicSchema = ProposalSchema.pick({
    name: true,
    slug: true,
})
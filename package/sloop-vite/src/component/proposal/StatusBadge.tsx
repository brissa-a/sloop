import { Badge } from "@mantine/core";
import { ProposalSchema } from "@sloop-common/prisma_zod";
import { z } from "zod";


const ProposalStatusSchema = ProposalSchema.pick({
    publishedAt: true,
    archivedAt: true,
})

type ProposalStatus = z.infer<typeof ProposalStatusSchema>

export function ProposalStatusBadge({ proposal }: { proposal: ProposalStatus }) {
    return <Badge variant='light' color={proposal.publishedAt === null || proposal.archivedAt !== null ? 'grey' : 'pirate'}>
        {proposal.publishedAt ? proposal.archivedAt ? 'Archivée' : 'Publiée' : 'Brouillon'}
    </Badge>
}
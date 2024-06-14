import { Prisma, PrismaClient } from "@sloop-common/prisma";

export async function deleteCascadeVote(prisma: PrismaClient | Prisma.TransactionClient, voterId: string, cascade: { votingVoteScore: true }) {
    await prisma.votingVoteScore.deleteMany({
        where: {
            ofVote: {
                voterId: voterId,
            }
        }
    });
    await prisma.votingVote.deleteMany({
        where: {
            voterId,
        }
    });
}
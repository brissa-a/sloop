import { Prisma, PrismaClient } from "@sloop-common/prisma";
import { validMembershipByUser } from "./membership";
import { nanoid } from "nanoid";

export const VOTE_BASE_POWER = 100;

export const basicVotingInclude = {
    group: {
        include: {
            memberships: true
        }
    },
    owners: true,
    meeting: {
        include: {
            presiders: true
        }
    }
} satisfies Prisma.VotingInclude

export type VotingNGroupNMembership = Prisma.VotingGetPayload<{
    include: typeof basicVotingInclude
}>

export async function startVoting(prisma: PrismaClient | Prisma.TransactionClient, sessionId: string, voting: VotingNGroupNMembership) {

    await initializeCopivote(prisma, sessionId, voting)

    const userToMarkUnseenIds = validMembershipByUser(voting.group.memberships).map(([userId,]) => userId)
    return await prisma.voting.update({
        where: { id: voting.id },
        data: {
            actualStartAt: new Date(),
            unseen: {
                create: userToMarkUnseenIds.map(userId => ({
                    id: nanoid(),
                    userId,
                    groupId: voting.groupId
                }))
            }
        }
    })
}

export async function initializeCopivote(prisma: PrismaClient | Prisma.TransactionClient, sessionId: string, voting: VotingNGroupNMembership) {

    const copies = await prisma.groupCopy.findMany({
        where: {
            groupId: voting.groupId,
        },
    });

    const validUsersMembership = validMembershipByUser(voting.group.memberships);
    for (const copy of copies) {
        const [, copierValidMemberships] = validUsersMembership.find(([userId,]) => userId === copy.copierId) || [null, null];
        const [, copiedValidMemberships] = validUsersMembership.find(([userId,]) => userId === copy.copiedId) || [null, null];
        if (!copierValidMemberships) {
            //Copier may no longer be in the group so it's normal
            //It will recover it's copivote when it rejoin the group
            continue;
        }
        if (!copiedValidMemberships) {
            console.error('No valid membership for copied', copy.copiedId);
            //TODO notify copier that copied user has no valid membership
            continue;
        }
        await prisma.votingVote.create({
            data: {
                id: nanoid(),
                createdById: sessionId,
                ofVotingId: voting.id,
                voterId: copy.copierId,
                validVoterMembershipId: copierValidMemberships[0]!.id,
                copiedId: copy.copiedId,
                power: copy.power,
                validCopiedMembershipId: copiedValidMemberships[0]!.id
            }
        });
    }
}
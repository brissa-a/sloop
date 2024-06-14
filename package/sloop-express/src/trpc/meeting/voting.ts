import { CreateVotingSchema, DoVoteSchema, EndVotingSchema, StartVotingSchema } from '@sloop-common/sloop_zod/meeting/voting';
import { logNDispatch } from '@sloop-express/misc/loggingNEvent';
import { isCaptainOf, isMemberOf, validMembershipByUser } from '@sloop-express/misc/membership';
import { prisma } from '@sloop-express/misc/prisma';
import { refresh } from '@sloop-express/misc/scheduler';
import { mandatory, procedure, router } from '@sloop-express/misc/trpc';
import { basicVotingInclude, startVoting } from '@sloop-express/misc/voting';
import { TRPCError } from '@trpc/server';
import { nanoid } from 'nanoid';
import { z } from 'zod';

export const votingRouter = router({
    "byId": procedure.input(z.object({ id: z.string() })).query(async (opts) => {
        return await prisma.voting.findUnique({
            where: { id: opts.input.id },
            include: {
                choices: {
                    include: {
                        scores: {
                            include: {
                                ofVote: {
                                    include: {
                                        voter: true,
                                        validVoterMembership: true
                                    }

                                }
                            }
                        },
                    }
                },
                votes: {
                    include: {
                        voter: true,
                        validVoterMembership: true,
                        scores: true,
                        copied: true
                    }
                }
            }
        })
    }),
    "start": procedure.input(StartVotingSchema).mutation(async (opts) => {
        const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
        const voting = await prisma.voting.findUnique({
            where: { id: opts.input.votingId },
            include: {
                ...basicVotingInclude,
            }
        })
        if (!voting) throw new TRPCError({ code: 'NOT_FOUND', message: 'Voting not found' })
        if (voting.actualStartAt != null) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Voting already started' })
        }

        if (!jwt.isAdmin
            && !isCaptainOf(jwt.user.id, voting.group.memberships)
            && !(voting.meeting?.presiders || []).map(presider => presider.userId).includes(jwt.user.id)
            && !voting.owners.map(owner => owner.id).includes(jwt.user.id)) {
            throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not part owner' })
        }
        return prisma.$transaction(async (prisma) => {
            const startedVoting = await startVoting(prisma, jwt.sessionId, voting)
            await logNDispatch(prisma, "StartVotingSchema", {
                meetingIds: voting.meetingId ? [voting.meetingId] : [],
                votingIds: [voting.id],
                userIds: [jwt.user.id]
            }, opts.input, jwt)
            return startedVoting
        });
    }),
    "end": procedure.input(EndVotingSchema).mutation(async (opts) => {
        const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
        const voting = await prisma.voting.findUnique({
            where: { id: opts.input.votingId },
            include: {
                ...basicVotingInclude,
            }
        })
        if (!voting) throw new TRPCError({ code: 'NOT_FOUND', message: 'Voting not found' })
        if (voting.actualEndAt != null) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Voting already ended' })
        }

        if (!jwt.isAdmin
            && !isCaptainOf(jwt.user.id, voting.group.memberships)
            && !(voting.meeting?.presiders || []).map(presider => presider.userId).includes(jwt.user.id)
            && !voting.owners.map(owner => owner.id).includes(jwt.user.id)) {
            throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not admin, captain, presider or owner' })
        }
        return prisma.$transaction(async (prisma) => {
            const endedVoting = await prisma.voting.update({
                where: { id: voting.id },
                data: {
                    actualEndAt: new Date()
                }
            })
            await logNDispatch(prisma, "EndVotingSchema", {
                meetingIds: voting.meetingId ? [voting.meetingId] : [],
                votingIds: [voting.id],
                userIds: [jwt.user.id]
            }, opts.input, jwt)
            return endedVoting
        });
    }),
    "create": procedure.input(CreateVotingSchema).mutation(async (opts) => {
        const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
        const { user, sessionId } = jwt;
        const group = await prisma.group.findUnique({
            where: { id: opts.input.groupId },
            include: { memberships: true }
        })
        if (!group) throw new TRPCError({ code: 'NOT_FOUND', message: 'group not found' })

        if (jwt.isAdmin === false && !isMemberOf(user.id, group.memberships)) {
            throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not admin or member of the group' })
        }

        if (jwt.isAdmin === false && !isCaptainOf(user.id, group.memberships) && opts.input.meetingId) {
            const meeting = await prisma.meeting.findUnique({
                where: { id: opts.input.meetingId },
                include: { group: true, presiders: true }
            })
            if (!meeting) throw new TRPCError({ code: 'NOT_FOUND', message: 'Meeting not found' })
            if (meeting.groupId !== opts.input.groupId) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Meeting not part of the group' })
            }
            if (meeting.presiders.map(presider => presider.userId).includes(user.id) === false) {
                throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not presider of the meeting' })
            }
        }

        if (opts.input.proposalId) {
            const proposal = await prisma.proposal.findUnique({
                where: { id: opts.input.proposalId },
            })
            if (!proposal) throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' })
            if (proposal.groupId !== opts.input.groupId) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Proposal not part of this group' })
            }
            if (!jwt.isAdmin && !isCaptainOf(user.id, group.memberships)) {
                throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not author of the proposal, captain or admin' })
            }
        }

        const createdVoting = await prisma.$transaction(async (prisma) => {
            const createdVoting = await prisma.voting.create({
                include: basicVotingInclude,
                data: {
                    id: nanoid(),
                    name: opts.input.name,
                    slug: opts.input.slug,
                    description: opts.input.description,
                    scheduledStartAt: opts.input.scheduledStartAt,
                    scheduledEndAt: opts.input.scheduledEndAt,
                    createdBy: { connect: { id: sessionId } },
                    meeting: opts.input.meetingId ? { connect: { id: opts.input.meetingId } } : undefined,
                    agendaPoint: opts.input.agendaPointId ? { connect: { id: opts.input.agendaPointId } } : undefined,
                    choices: {
                        create: opts.input.choices.map(choice => ({ id: nanoid(), name: choice }))
                    },
                    group: { connect: { id: opts.input.groupId, } },
                    votingMethod: opts.input.votingMethod,
                    votingMethodParams: opts.input.votingMethodParams || {},
                    autoStartEnd: opts.input.autoStartEnd,
                    proposal: opts.input.proposalId ? { connect: { id: opts.input.proposalId } } : undefined,
                }
            })
            if (opts.input.startImmediately) {
                await startVoting(prisma, sessionId, createdVoting)
            }
            await logNDispatch(prisma, "CreateVotingSchema", {
                meetingIds: opts.input.meetingId ? [opts.input.meetingId] : [],
                votingIds: [createdVoting.id],
                userIds: [user.id]
            }, opts.input, jwt)
            return createdVoting
        })
        if (opts.input.autoStartEnd && !opts.input.startImmediately) {
            await refresh()
        }
        return createdVoting
    }),
    "vote": procedure.input(DoVoteSchema).mutation(async (opts) => {
        const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
        const { user } = jwt;

        //Voter must be part of the voting group
        const voting = await prisma.voting.findUnique({
            where: { id: opts.input.votingId },
            include: {
                group: {
                    include: {
                        memberships: true
                    }
                },
                choices: true,
            }
        })
        if (!voting) throw new TRPCError({ code: 'NOT_FOUND', message: 'Voting not found' })
        if (voting.actualStartAt === null) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Voting not started yet' })
        }
        if (voting.actualEndAt !== null) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Voting already ended' })
        }

        const userVotedVotes = opts.input.votes.filter(vote => vote.scores.length > 0)


        for (const choice of voting.choices) {
            for (const vote of userVotedVotes) {
                if (!vote.scores.find(score => score.forChoiceId === choice.id)) {
                    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Missing score for choice ' + choice.name })
                }
            }
        }

        const totalPower = opts.input.votes.reduce((acc, vote) => acc + vote.power, 0)
        if (totalPower > 100) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Total power of votes exceeds 100%' })
        }

        const members = validMembershipByUser(voting.group.memberships)
        const [, voterMemberships] = members.find(([userId,]) => userId === user.id) || [null, []]
        //TODO maybe be more specific ? here if there is more than one valid membership we take an arbitrary one
        const membership = voterMemberships[0]
        if (!membership) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Voter not part of the voting group' })

        return await prisma.$transaction(async (prisma) => {
            await prisma.votingVoteScore.deleteMany({
                where: {
                    ofVote: {
                        ofVotingId: opts.input.votingId,
                        voter: {
                            id: user.id
                        }
                    }
                }
            })
            await prisma.votingVote.deleteMany({
                where: {
                    ofVotingId: opts.input.votingId,
                    voter: {
                        id: user.id
                    }
                }
            })

            for (const vote of opts.input.votes) {
                await prisma.votingVote.create({
                    data: {
                        id: nanoid(),
                        voter: { connect: { id: user.id } },
                        createdBy: { connect: { id: jwt.sessionId } },
                        validVoterMembership: { connect: { id: membership.id } },
                        ofVoting: { connect: { id: opts.input.votingId } },
                        copied: vote.copiedId ? { connect: { id: vote.copiedId } } : undefined,
                        scores: {
                            create: vote.scores.map(score => {
                                return {
                                    id: nanoid(),
                                    forChoice: { connect: { id: score.forChoiceId } },
                                    score: score.score,
                                }
                            })
                        },
                        power: vote.power,
                    }
                })
            }

            await logNDispatch(prisma, "DoVoteSchema", {
                meetingIds: voting.meetingId ? [voting.meetingId] : [],
                votingIds: [voting.id],
                userIds: [user.id]
            }, opts.input, jwt)
            return
        })
    }),
})



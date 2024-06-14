import { prisma } from '@sloop-express/misc/prisma';
import { procedure, router } from '@sloop-express/misc/trpc';
import { z } from 'zod';

//Dont forget to add your router to src/trpc/index.ts:

export const unseenRouter = router({
    "get": procedure.query(async (opts) => {
        if (!opts.ctx.jwtPayload?.user) {
            return {
                unseenVoting: [],
                unseenMeeting: [],
                unseenProposal: []
            }
        }
        const unseenVoting = await prisma.votingUnseen.findMany({
            where: {
                userId: opts.ctx.jwtPayload?.user.id
            },
        })
        const unseenProposal = await prisma.proposalUnseen.findMany({
            where: {
                userId: opts.ctx.jwtPayload?.user.id
            },
        })
        const unseenMeeting = await prisma.meetingUnseen.findMany({
            where: {
                userId: opts.ctx.jwtPayload?.user.id
            },
        })
        return {
            unseenVoting,
            unseenMeeting,
            unseenProposal
        }
    }),
    "markVotingAsSeen": procedure.input(z.object({ votingId: z.string() })).mutation(async (opts) => {
        if (!opts.ctx.jwtPayload?.user) {
            return
        }
        const ret = await prisma.votingUnseen.deleteMany({
            where: {
                votingId: opts.input.votingId,
                userId: opts.ctx.jwtPayload?.user.id,
            }
        })
        return ret
    }),
    "markProposalAsSeen": procedure.input(z.object({ proposalId: z.string() })).mutation(async (opts) => {
        if (!opts.ctx.jwtPayload?.user) {
            return
        }
        const ret = await prisma.proposalUnseen.deleteMany({
            where: {
                proposalId: opts.input.proposalId,
                userId: opts.ctx.jwtPayload?.user.id,
            }
        })
        return ret
    }),
    "markMeetingAsSeen": procedure.input(z.object({ meetingId: z.string() })).mutation(async (opts) => {
        if (!opts.ctx.jwtPayload?.user) {
            return
        }
        const ret = await prisma.meetingUnseen.deleteMany({
            where: {
                meetingId: opts.input.meetingId,
                userId: opts.ctx.jwtPayload?.user.id,
            }
        })
        return ret
    }),
})
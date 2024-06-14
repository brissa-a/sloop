import { isMemberOf } from '@sloop-express/misc/membership';
import { prisma } from '@sloop-express/misc/prisma';
import { mandatory, procedure, router } from '@sloop-express/misc/trpc';
import { TRPCError } from '@trpc/server';
import { nanoid } from 'nanoid';
import { z } from 'zod';


export const coauthorRouter = router({
    "acceptInvitation": procedure.input(z.object({ coauthorId: z.string() })).mutation(async (opts) => {
        const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
        const proposal = await prisma.proposalCoauthor.findUnique({
            where: {
                id: opts.input.coauthorId
            },
            include: {
                proposal: {
                    include: {
                        group: {
                            include: {
                                memberships: true
                            }
                        }
                    }
                }
            }
        })

        if (!proposal) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Proposal not found"
            })
        }

        if (proposal.userId != jwt.user.id) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "You can't accept the invitation of someone else"
            })
        }

        if (proposal.acceptedByCoauthorAt) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "The invitation has already been accepted"
            })
        }

        return await prisma.$transaction(async prisma => {
            await prisma.proposalCoauthor.update({
                where: {
                    id: opts.input.coauthorId
                },
                data: {
                    acceptedByCoauthorAt: new Date()
                }
            })
            //TODO
            // await logNDispatch(prisma, "", {
            //     groupIds: [proposal.proposal.groupId],
            //     proposalIds: [proposal.proposalId],
            //     userIds: [proposal.proposal.authorId],
            // }, opts.input, jwt);
        })
    }),
    "acceptRequest": procedure.input(z.object({ coauthorId: z.string() })).mutation(async (opts) => {
        // const jwt =
        mandatory(opts.ctx.jwtPayload, "jwt")
        const coauthor = await prisma.proposalCoauthor.findUnique({
            where: {
                id: opts.input.coauthorId
            },
            include: {
                proposal: {
                    include: {
                        group: {
                            include: {
                                memberships: true
                            }
                        }
                    }
                }
            }
        })

        if (!coauthor) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Proposal not found"
            })
        }

        if (coauthor.acceptedByAuthorAt) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "The request has already been accepted"
            })
        }

        return await prisma.$transaction(async prisma => {
            await prisma.proposalCoauthor.update({
                where: {
                    id: coauthor.id
                },
                data: {
                    acceptedByAuthorAt: new Date()
                }
            })
            //TODO
            // await logNDispatch(prisma, "", {
            //     groupIds: [proposal.proposal.groupId],
            //     proposalIds: [proposal.proposalId],
            //     userIds: [proposal.proposal.authorId],
            // }, opts.input, jwt);
        })
    }),
    "inviteCoauthor": procedure.input(z.object({ proposalId: z.string(), userId: z.string() })).mutation(async (opts) => {
        const jwt = mandatory(opts.ctx.jwtPayload, "jwt")

        const proposal = await prisma.proposal.findUnique({
            where: {
                id: opts.input.proposalId
            },
            include: {
                group: {
                    include: {
                        memberships: true
                    }
                },
                coauthors: true
            }
        })
        if (!proposal) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Proposal not found"
            })
        }

        if (proposal.authorId !== jwt.user.id) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "You must be the author of the proposal to invite a coauthor"
            })
        }

        if (proposal.coauthors.map(x => x.userId).includes(opts.input.userId)) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "The user is already a coauthor of the proposal"
            })
        }

        if (!isMemberOf(opts.input.userId, proposal.group.memberships)) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "The invited user must be a member of the group"
            })
        }
        return await prisma.$transaction(async prisma => {
            await prisma.proposalCoauthor.create({
                data: {
                    id: nanoid(),
                    user: { connect: { id: opts.input.userId } },
                    proposal: {
                        connect: { id: opts.input.proposalId },
                    },
                    acceptedByAuthorAt: new Date(),
                    acceptedByCoauthorAt: null,
                }
            })
            //TODO
            // await logNDispatch(prisma, "", {
            //     groupIds: [proposal.groupId],
            //     proposalIds: [proposal.id],
            //     userIds: [opts.input.userId],
            // }, opts.input, jwt);
        })
    }),
    "requestToBeCoauthor": procedure.input(z.object({ proposalId: z.string() })).mutation(async (opts) => {
        const jwt = mandatory(opts.ctx.jwtPayload, "jwt")

        const proposal = await prisma.proposal.findUnique({
            where: {
                id: opts.input.proposalId
            },
            include: {
                group: {
                    include: {
                        memberships: true
                    }
                },
                coauthors: true
            }
        })
        if (!proposal) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Proposal not found"
            })
        }
        if (!isMemberOf(jwt.user.id, proposal.group.memberships)) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "You must be a member of the group to request to be a coauthor"
            })
        }

        if (proposal.coauthors.map(x => x.userId).includes(jwt.user.id)) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "You are already a coauthor of the proposal"
            })
        }
        return await prisma.$transaction(async prisma => {
            // const newProposalCoauthor = 
            await prisma.proposalCoauthor.create({
                data: {
                    id: nanoid(),
                    user: { connect: { id: jwt.user.id } },
                    proposal: {
                        connect: { id: opts.input.proposalId },
                    },
                    acceptedByAuthorAt: null,
                    acceptedByCoauthorAt: new Date(),
                }
            })
            //TODO
            // await logNDispatch(prisma, "", {
            //     groupIds: [proposal.group.id],
            //     userIds: [proposal.authorId],
            // }, opts.input, jwt); return { newProposalCoauthor }
        })
    }),
})
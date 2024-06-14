import { ArchiveProposalSchema, CreateProposalSchema, PublishProposalSchema, UpdateProposalSchema } from '@sloop-common/sloop_zod/proposal';
import { isCaptainOf, validMembershipByUser } from '@sloop-express/misc/membership';
import { prisma } from '@sloop-express/misc/prisma';
import { mandatory, procedure, router } from '@sloop-express/misc/trpc';
import { TRPCError } from '@trpc/server';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { coauthorRouter } from './proposal/coauthor';
import { logNDispatch } from '@sloop-express/misc/loggingNEvent';

//Dont forget to add your router to src/trpc/index.ts:

const defaultContent = `
# Exposé des motifs:

---

# Contenu de la proposition:
`.trimStart()

export const proposalRouter = router({
    "coauthor": coauthorRouter,
    "list": procedure.input(z.object({ groupId: z.string() })).query(async (opts) => {
        return await prisma.proposal.findMany({
            where: {
                groupId: opts.input.groupId,
            },
            include: {
                coauthors: {
                    select: {
                        id: true,
                    }
                }
            }
        })
    }),
    "byId": procedure.input(z.object({ id: z.string() })).query(async (opts) => {
        return await prisma.proposal.findUnique({
            where: {
                id: opts.input.id
            }
        })
    }),
    "create": procedure.input(CreateProposalSchema).mutation(async (opts) => {
        const jwt = mandatory(opts.ctx.jwtPayload, "jwt")

        const group = await prisma.group.findUnique({
            where: {
                id: opts.input.groupId
            },
            include: {
                memberships: true,
            }
        })
        if (!group) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Group not found"
            })
        }


        const validMember = validMembershipByUser(group.memberships)
        if (!jwt.isAdmin && !validMember.map(x => x[0]).includes(jwt.user.id)) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "You must be admin or a member of the group to create a proposal"
            })
        }

        prisma.$transaction(async prisma => {
            const newProposal = await prisma.proposal.create({
                data: {
                    id: nanoid(),
                    authorId: jwt.user.id,
                    createdById: jwt.sessionId,
                    ...opts.input,
                    content: defaultContent,
                }
            })
            await logNDispatch(prisma, "CreateProposalSchema", {
                userIds: [jwt.user.id],
                groupIds: [group.id],
            }, opts.input, jwt)
            return newProposal
        })
    }),
    "publish": procedure.input(PublishProposalSchema).mutation(async (opts) => {
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
                }
            }
        })

        if (!proposal) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Proposal not found"
            })
        }
        if (proposal.publishedAt !== null) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Proposal is already published"
            })
        }

        if (jwt.isAdmin === false && proposal.authorId !== jwt.user.id && !isCaptainOf(jwt.user.id, proposal.group.memberships)) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "You must be the author of the proposal, captain of the group, or admin to publish a proposal"
            })
        }

        const validMember = validMembershipByUser(proposal.group.memberships)

        const userToMarkUnseenIds = validMember.map(([userId,]) => userId).filter(x => x !== jwt.user.id)

        return prisma.$transaction(async prisma => {
            await prisma.proposal.update({
                where: {
                    id: opts.input.proposalId
                },
                data: {
                    publishedAt: new Date(),
                    unseen: {
                        create: userToMarkUnseenIds.map(x => ({
                            id: nanoid(),
                            userId: x,
                            groupId: proposal.groupId,
                        }))
                    }
                }
            })
            await logNDispatch(prisma, "PublishProposalSchema", {
                userIds: [jwt.user.id],
                groupIds: [proposal.group.id],
            }, opts.input, jwt)

        })
    }),
    "archive": procedure.input(ArchiveProposalSchema).mutation(async (opts) => {
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
                }
            }
        })

        if (!proposal) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Proposal not found"
            })
        }

        if (jwt.isAdmin === false && proposal.authorId !== jwt.user.id && !isCaptainOf(jwt.user.id, proposal.group.memberships)) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "You must be the author of the proposal, captain of the group, or admin to archive a proposal"
            })
        }

        return prisma.$transaction(async prisma => {
            await prisma.proposal.update({
                where: {
                    id: opts.input.proposalId
                },
                data: {
                    archivedAt: new Date(),
                }
            })
            await logNDispatch(prisma, "ArchiveProposalSchema", {
                userIds: [jwt.user.id],
                groupIds: [proposal.group.id],
            }, opts.input, jwt)

        })
    }),
    "update": procedure.input(UpdateProposalSchema).mutation(async (opts) => {
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
                }
            }
        })

        if (!proposal) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Proposal not found"
            })
        }

        if (proposal.authorId !== jwt.user.id && jwt.isAdmin === false && !isCaptainOf(jwt.user.id, proposal.group.memberships)) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "You must be the author of the proposal, captain, or admin to create a new version"
            })
        }
        await prisma.proposal.update({
            where: {
                id: opts.input.proposalId
            },
            data: {
                ...opts.input.update
            }
        })
    }),
})
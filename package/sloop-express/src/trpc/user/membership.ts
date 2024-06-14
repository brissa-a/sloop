import { AddMembershipSchema, JoinGroupSchema, LeaveGroupSchema, RevokeMembershipSchema } from "@sloop-common/sloop_zod/user/membership";
import { logNDispatch } from '@sloop-express/misc/loggingNEvent';
import { isBetweenStartAndExpiration, isCaptainOf, isMemberOf, validMembershipByUser } from '@sloop-express/misc/membership';
import { prisma } from '@sloop-express/misc/prisma';
import { mandatory, procedure, router } from '@sloop-express/misc/trpc';
import { TRPCError } from '@trpc/server';
import { nanoid } from 'nanoid';

//Dont forget to add your router to src/trpc/index.ts:

export const membershipRouter = router({
    "add": procedure.input(AddMembershipSchema).mutation(async (opts) => {
        const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
        const group = await prisma.group.findUnique({
            where: {
                id: opts.input.groupId
            },
            include: {
                memberships: true,
            }
        })
        if (!group) throw new TRPCError({ code: 'NOT_FOUND', message: 'Group not found' })
        const currentUserIsCaptain = isCaptainOf(jwt.user.id, group.memberships)
        if (!jwt.isAdmin && !currentUserIsCaptain) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not allowed to add membership' })
        }
        return await prisma.$transaction(async prisma => {
            const newGroupMembership = await prisma.groupMembership.create({
                data: {
                    id: nanoid(),
                    ...opts.input
                }
            })
            await logNDispatch(prisma, "AddMembershipSchema", {
                groupIds: [opts.input.groupId],
                userIds: [opts.input.userId]
            }, opts.input, jwt)
            return newGroupMembership
        })
    }),
    "join": procedure.input(JoinGroupSchema).mutation(async (opts) => {
        const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
        const group = await prisma.group.findUnique({
            where: {
                id: opts.input.groupId
            },
            include: {
                memberships: true,
            }
        })
        const ap = await prisma.group.findUnique({
            where: {
                slug: "assemblee-permanente"
            },
            include: {
                memberships: true,
            }
        })
        if (!ap) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'AP not found. what ? how ?' })

        const isMemberOfAp = isMemberOf(jwt.user.id, ap.memberships)

        if (!isMemberOfAp) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'You must be a member of the assemble-permanente group before' })
        }

        if (!group) throw new TRPCError({ code: 'NOT_FOUND', message: 'Group not found' })
        const [, currentUserValidMembership] = validMembershipByUser(group.memberships).find(([userId,]) => userId === jwt.user.id) || [null, []]

        if (currentUserValidMembership.length > 0) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already a member of this group' })
        }

        if (group.requireJoinValidation) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Group requires join validation' })
        }

        return await prisma.$transaction(async prisma => {
            const newGroupMembership = await prisma.groupMembership.create({
                data: {
                    id: nanoid(),
                    role: "MEMBER",
                    startDate: new Date(),
                    group: { connect: { id: opts.input.groupId } },
                    user: { connect: { id: jwt.user.id } }
                }
            })
            await logNDispatch(prisma, "JoinGroupSchema", {
                groupIds: [opts.input.groupId],
                userIds: [jwt.user.id]
            }, opts.input, jwt)
            return newGroupMembership
        })
    }),
    "leave": procedure.input(LeaveGroupSchema).mutation(async (opts) => {
        const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
        const group = await prisma.group.findUnique({
            where: {
                id: opts.input.groupId
            },
            include: {
                memberships: true,
            }
        })
        if (!group) throw new TRPCError({ code: 'NOT_FOUND', message: 'Group not found' })
        const [, currentUserValidMembership] = validMembershipByUser(group.memberships).find(([userId,]) => userId === jwt.user.id) || [null, []]

        if (currentUserValidMembership.some(x => x.role === "CAPTAIN")) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'You must first leave your status of Captain before leaving the group' })
        }

        if (currentUserValidMembership.length === 0) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Currently not a member of this group' })
        }

        if (group.requireLeaveValidation) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Group requires leave validation' })
        }

        return await prisma.$transaction(async prisma => {
            const ret = await prisma.groupMembership.updateMany({
                where: {
                    id: { in: currentUserValidMembership.map(x => x.id) }
                },
                data: {
                    expirationDate: new Date()
                }
            })
            await logNDispatch(prisma, "LeaveGroupSchema", {
                groupIds: [opts.input.groupId],
                userIds: [jwt.user.id]
            }, opts.input, jwt)

            return {
                expiredValidMembershipCount: ret.count
            }
        })
    }),
    "revoke": procedure.input(RevokeMembershipSchema).mutation(async (opts) => {
        const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
        const membershipToRevoke = await prisma.groupMembership.findUnique({
            where: {
                id: opts.input.membershipId
            },
            include: {
                group: {
                    include: {
                        memberships: true,
                    }
                }
            }
        })
        if (!membershipToRevoke) throw new TRPCError({ code: 'NOT_FOUND', message: 'Membership not found' })

        const othersGroupMemberships = membershipToRevoke.group.memberships
        const currentUserCaptainMembership = othersGroupMemberships.filter(m => {
            return m.userId === jwt.user.id && m.role === 'CAPTAIN' && isBetweenStartAndExpiration(m)
        })
        //Expiration date is before now
        if (membershipToRevoke.expirationDate && membershipToRevoke.expirationDate < new Date()) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Membership already expired' })

        //jwt user must be admin or group captain
        if (!jwt.isAdmin && currentUserCaptainMembership.length === 0) {
            console.log(jwt.isAdmin, currentUserCaptainMembership)
            throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not allowed to revoke this membership' })
        }

        const revokedMembership = await prisma.$transaction(async prisma => {
            const revokedMembership = await prisma.groupMembership.update({
                where: {
                    id: membershipToRevoke.id
                },
                data: {
                    expirationDate: new Date()
                }
            })
            await logNDispatch(prisma, "RevokeMembershipSchema", {
                groupIds: [membershipToRevoke.group.id],
                userIds: [membershipToRevoke.userId]
            }, opts.input, jwt)
            return revokedMembership
        })
        return revokedMembership
    }),
})
import { AddCopySchema, DelCopySchema } from '@sloop-common/sloop_zod/group';
import { logNDispatch } from '@sloop-express/misc/loggingNEvent';
import { isBetweenStartAndExpiration } from '@sloop-express/misc/membership';
import { prisma } from '@sloop-express/misc/prisma';
import { mandatory, procedure, router } from '@sloop-express/misc/trpc';
import { VOTE_BASE_POWER } from '@sloop-express/misc/voting';
import { TRPCError } from '@trpc/server';
import { nanoid } from 'nanoid';

//Dont forget to add your router to src/trpc/index.ts:

export const copyvoteRouter = router({
    "delete": procedure.input(DelCopySchema).mutation(async (opts) => {
        const jwt = mandatory(opts.ctx.jwtPayload, 'jwt')

        const giver = await prisma.user.findUnique({
            where: { id: jwt.user.id },
            include: { groupMembership: true }
        })

        const receiver = await prisma.user.findUnique({
            where: { id: opts.input.receiverId },
            include: { groupMembership: true }
        })

        if (!giver) throw new TRPCError({ code: 'NOT_FOUND', message: 'Giver not found' })
        if (!receiver) throw new TRPCError({ code: 'NOT_FOUND', message: 'Receiver not found' })

        const giverIsInGroup = giver.groupMembership.filter(isBetweenStartAndExpiration).filter(m => m.groupId === opts.input.groupId).length > 0
        const receiverIsInGroup = receiver.groupMembership.filter(isBetweenStartAndExpiration).filter(m => m.groupId === opts.input.groupId).length > 0

        if (!giverIsInGroup) throw new TRPCError({ code: 'NOT_FOUND', message: 'Giver is not in the group' })
        if (!receiverIsInGroup) throw new TRPCError({ code: 'NOT_FOUND', message: 'Receiver is not in the group' })

        const deleted = await prisma.$transaction(async prisma => {

            const deleted = await prisma.groupCopy.delete({
                where: {
                    copierId_copiedId_groupId: {
                        copierId: giver.id,
                        copiedId: receiver.id,
                        groupId: opts.input.groupId
                    }
                }
            })
            await logNDispatch(prisma, "DelCopySchema", {
                meetingIds: [],//notify meeting or vote with this group ? No not required because change in delegation does not affect meeting or vote after they started
                userIds: [giver.id, receiver.id]
            }, opts.input, jwt)
            return deleted

        })
        return deleted
    }),
    "add": procedure.input(AddCopySchema).mutation(async (opts) => {
        const jwt = mandatory(opts.ctx.jwtPayload, 'jwt')

        const copier = await prisma.user.findUnique({
            where: { id: jwt.user.id },
            include: { groupMembership: true }
        })

        const copied = await prisma.user.findUnique({
            where: { id: opts.input.receiverId },
            include: { groupMembership: true }
        })

        if (!copier) throw new TRPCError({ code: 'NOT_FOUND', message: 'Copier not found' })
        if (!copied) throw new TRPCError({ code: 'NOT_FOUND', message: 'Copied not found' })

        const giverIsInGroup = copier.groupMembership.filter(isBetweenStartAndExpiration).filter(m => m.groupId === opts.input.groupId).length > 0
        const receiverIsInGroup = copied.groupMembership.filter(isBetweenStartAndExpiration).filter(m => m.groupId === opts.input.groupId).length > 0

        if (!giverIsInGroup) throw new TRPCError({ code: 'NOT_FOUND', message: 'Giver is not in the voting group' })
        if (!receiverIsInGroup) throw new TRPCError({ code: 'NOT_FOUND', message: 'Receiver is not in the voting group' })

        const existingCopy = await prisma.groupCopy.findMany({
            where: {
                copierId: copier.id,
                groupId: opts.input.groupId
            }
        })
        const totalPower = existingCopy.reduce((acc, vote) => acc + vote.power, 0)
        if (totalPower + opts.input.power > VOTE_BASE_POWER) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Power exceeded' })
        }

        const created = await prisma.groupCopy.create({
            select: { id: true },
            data: {
                id: nanoid(),
                power: opts.input.power,
                copier: { connect: { id: copier.id } },
                copied: { connect: { id: copied.id } },
                group: {
                    connect: { id: opts.input.groupId },
                },
            }
        })
        await logNDispatch(prisma, "AddCopySchema", {
            meetingIds: [],//notify meeting or vote with this group ? No not required because change in delegation does not affect meeting or vote after they started
            userIds: [copier.id, copied.id]
        }, opts.input, jwt)
        return created
    }),
})
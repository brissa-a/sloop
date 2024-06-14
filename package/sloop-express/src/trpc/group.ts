import { CreateGroupSchema } from '@sloop-common/sloop_zod/group';
import { validMembershipByUser } from '@sloop-express/misc/membership';
import { prisma } from '@sloop-express/misc/prisma';
import { mandatory, procedure, router } from '@sloop-express/misc/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { copyvoteRouter } from './group/copyvote';
import { nanoid } from 'nanoid';
import { logNDispatch } from '@sloop-express/misc/loggingNEvent';

//Dont forget to add your router to src/trpc/index.ts:

export const groupRouter = router({
    "copyvote": copyvoteRouter,
    "create": procedure.input(CreateGroupSchema).mutation(async opts => {

        const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
        if (!jwt.isAdmin) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'You must be admin' })
        }
        return await prisma.$transaction(async prisma => {
            const newGroup = await prisma.group.create({
                data: {
                    id: nanoid(),
                    name: opts.input.name,
                    slug: opts.input.slug,
                    joinConditionMd: "",
                    leaveConditionMd: "",
                    requireJoinValidation: true,
                    requireLeaveValidation: true,
                    memberships: opts.input.initialCaptainId ? {
                        create: {
                            id: nanoid(),
                            startDate: new Date(),
                            userId: opts.input.initialCaptainId,
                            role: 'CAPTAIN',
                        }
                    } : undefined
                }
            })
            await logNDispatch(prisma, "CreateGroupSchema", {
                meetingIds: [],//notify meeting or vote with this group ? No not required because change in delegation does not affect meeting or vote after they started
                userIds: opts.input.initialCaptainId ? [opts.input.initialCaptainId] : [],
                groupIds: [newGroup.id]
            }, opts.input, jwt)

            return newGroup
        })
    }),
    "list": procedure.query(() => {
        return prisma.group.findMany({
            select: {
                id: true, name: true, slug: true,
            }
        })
    }),
    "byId": procedure.input(z.object({
        id: z.string()
    })).query(async opts => {
        const group = await prisma.group.findUnique({
            where: { id: opts.input.id },
            include: {
                memberships: {
                    include: {
                        user: { select: { id: true, username: true, avatarUrl: true, slug: true } }
                    }

                },
                votings: {
                    select: { id: true }
                },
                copies: true
            },
        })
        if (!group) throw new TRPCError({ code: 'NOT_FOUND', message: 'Group not found' })
        const members = validMembershipByUser(group.memberships).flatMap(([userId, userValidMemberships]) => {
            const { id, avatarUrl, slug, username } = userValidMemberships[0]!.user
            if (id && avatarUrl && slug && username) {
                return [{ userId, roles: userValidMemberships.map(x => x.role), id, avatarUrl, slug, username }]
            } else {
                return []
            }
        })
        return { ...group, members }//Add members to group
    }),
})

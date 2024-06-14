
import { prisma } from '@sloop-express/misc/prisma';
import { mandatory, procedure, router } from '@sloop-express/misc/trpc';
import { TRPCError } from '@trpc/server';


import { logNDispatch, meetingEventsSubscribers, raisedHands } from '@sloop-express/misc/loggingNEvent';
import { isCaptainOf, validMembershipByUser } from '@sloop-express/misc/membership';
import { nanoid } from 'nanoid';
import { AddInviteeSchema, CreateMeetingSchema, UpdateMeetingSchema } from 'sloop-common/sloop_zod/meeting';
import { z } from 'zod';
import { agendaRouter } from './meeting/agenda';
import { messageRouter } from './meeting/message';
import { votingRouter } from './meeting/voting';


export const meetingRouter = router({
    "message": messageRouter,
    "agenda": agendaRouter,
    "voting": votingRouter,
    "byId": procedure.input(z.object({
        id: z.string()
    })).query(async opts => {
        const bddMeeting = await prisma.meeting.findUnique({
            where: { id: opts.input.id },
            include: {
                invitees: { select: { user: { select: { id: true, slug: true } } } },
                attendees: { select: { user: { select: { id: true, slug: true } } } },
                group: {
                    select: { id: true, slug: true, name: true, }
                },
                logEntries: {
                    include: {
                        entry: {
                            include: {
                                doneBy: {
                                    select: {
                                        isAdmin: true,
                                        principal: true,
                                        user: true,
                                    }
                                }
                            }
                        },
                    }
                },
                currentAgendaPoint: true,
                pointAgenda: true,
                messages: true,
                voting: {
                    include: {
                        createdBy: {
                            select: {
                                user: true
                            }
                        },
                        choices: {
                            include: {
                                scores: {
                                    include: {
                                        ofVote: {
                                            include: {
                                                voter: true
                                            }
                                        }
                                    }
                                },
                            }
                        }
                    }
                },
            }
        })

        const meetingSubcriptionsById = meetingEventsSubscribers.subscribers[opts.input.id] || {}
        const meetingSubcriptions = Object.values(meetingSubcriptionsById)
        if (bddMeeting === null) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Meeting not found'
            })
        }
        return {
            ...bddMeeting,
            subscriptions: meetingSubcriptions,
            raisedHands: raisedHands[opts.input.id] || {}
        }
    }),
    "lowerHand": procedure.input(z.object({ id: z.string() })).mutation(async opts => {
        return await prisma.$transaction(async tx => {
            const meetingId = opts.input.id
            const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
            const { user } = jwt
            raisedHands[meetingId] = raisedHands[meetingId] || {}
            delete raisedHands[meetingId]![user.id]
            await logNDispatch(tx, "LowerHandSchema", {
                meetingIds: [meetingId],
                userIds: [user.id]
            }, opts.input, jwt)
            return
        })
    }),
    "raiseHand": procedure.input(z.object({ id: z.string() })).mutation(async opts => {
        return await prisma.$transaction(async tx => {
            const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
            const { user } = jwt
            const meetingId = opts.input.id
            raisedHands[meetingId] = raisedHands[meetingId] || {}
            raisedHands[meetingId]![user.id] = new Date()
            await logNDispatch(tx, "RaiseHandSchema", {
                meetingIds: [meetingId],
                userIds: [user.id]
            }, opts.input, jwt)
            return
        })
    }),
    //TODO "sendAllMissingInvitation": 
    //TODO "sendUserInvitation": ,
    "addInvitee": procedure.input(AddInviteeSchema).mutation(async opts => {
        return await prisma.$transaction(async tx => {
            const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
            // const meeting = await tx.meeting.findUnique({ where: { id: opts.input.meetingId } })
            // if (!meeting) {
            //     throw new TRPCError({
            //         code: 'NOT_FOUND',
            //         message: 'Meeting not found'
            //     })
            // }
            const updated = await tx.meeting.update({
                where: { id: opts.input.meetingId },
                data: {
                    invitees: {
                        create: {
                            id: nanoid(),
                            user: { connect: { id: opts.input.userId } },
                        }
                    }
                }
            })
            await logNDispatch(tx, "AddInviteeSchema", {
                meetingIds: [updated.id],
                userIds: [opts.input.userId]
            }, opts.input, jwt)
            return updated
        })
    }),
    "start": procedure.input(z.object({ id: z.string() })).mutation(async opts => {
        return await prisma.$transaction(async tx => {
            const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
            const { user } = jwt
            const updated = await tx.meeting.update({
                where: { id: opts.input.id },
                data: {
                    actualStartAt: new Date()
                }
            })
            await logNDispatch(tx, "StartMeetingSchema", {
                meetingIds: [updated.id],
                userIds: [user.id]
            }, opts.input, jwt)
            return updated
        })
    }),
    "end": procedure.input(z.object({ id: z.string() })).mutation(async opts => {
        return await prisma.$transaction(async tx => {
            const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
            const { user } = jwt;
            const updated = await tx.meeting.update({
                where: { id: opts.input.id },
                data: {
                    actualEndAt: new Date()
                }
            })
            await logNDispatch(tx, "EndMeetingSchema", {
                meetingIds: [updated.id],
                userIds: [user.id]
            }, opts.input, jwt)
            return updated
        })
    }),
    "getAll": procedure.query(() => prisma.meeting.findMany()),
    "list": procedure.input(z.object({ groupId: z.string() })).query((opts) => prisma.meeting.findMany({
        where: { groupId: opts.input.groupId },
        select: {
            id: true,
            title: true,
            slug: true,
            scheduledEndAt: true,
            scheduledStartAt: true,
        }
    })),
    "create": procedure.input(CreateMeetingSchema).mutation(async opts => {
        return await prisma.$transaction(async tx => {
            const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
            const { user } = jwt;
            //TODO any stricter validation ?
            //creator must be a member of the group ?
            //or creator must be the group leader ?
            const group = await tx.group.findUnique({
                where: { id: opts.input.groupId },
                include: {
                    memberships: true
                },
            })
            if (!group) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Group not found'
                })
            }

            const groupMembers = validMembershipByUser(group.memberships)
            const newMeeting = await tx.meeting.create({
                data: {
                    id: nanoid(),
                    slug: opts.input.slug,
                    createdBy: { connect: { id: jwt.sessionId } },
                    location: "",
                    title: opts.input.title,
                    description: "",
                    scheduledStartAt: opts.input.scheduledStartAt,
                    scheduledEndAt: opts.input.scheduledEndAt,
                    group: { connect: { id: opts.input.groupId } },
                    invitees: {
                        create: groupMembers.map(([userId,]) => ({
                            id: nanoid(),
                            user: { connect: { id: userId } }
                        }))
                    }
                }
            })
            await logNDispatch(tx, "CreateMeetingSchema", {
                meetingIds: [newMeeting.id],
                userIds: [user.id]
            }, opts.input, jwt)
            return newMeeting
        })
    }),
    update: procedure.input(UpdateMeetingSchema).mutation(async opts => {
        return await prisma.$transaction(async tx => {
            const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
            const { user } = jwt

            const meeting = await tx.meeting.findUnique({
                where: { id: opts.input.id },
                include: {
                    group: {
                        include: {
                            memberships: true
                        }
                    },
                    presiders: true
                }
            })
            if (!meeting) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Meeting not found'
                })
            }
            console.log(
                `user.isAdmin: ${jwt.isAdmin}, 
                isCaptainOf(user.id, meeting?.group.memberships): ${isCaptainOf(user.id, meeting?.group.memberships)}, 
                meeting.presiders.some(p => p.id === user.id): ${meeting.presiders.some(p => p.id === user.id)}`
            )
            if (!jwt.isAdmin && !isCaptainOf(user.id, meeting?.group.memberships) && !meeting.presiders.some(p => p.id === user.id)) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'You are not allowed to update this meeting'
                })
            }

            const updated = await tx.meeting.update({
                where: { id: opts.input.id },
                data: opts.input.update
            })
            await logNDispatch(tx, "UpdateMeetingSchema", {
                meetingIds: [updated.id],
                userIds: [user.id]
            }, opts.input, jwt)
            return updated
        })
    }),
})


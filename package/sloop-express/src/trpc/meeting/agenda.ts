import { AddAgendaPointSchema, DeleteAgendaPointSchema } from "@sloop-common/sloop_zod/meeting/agenda";
import { logNDispatch } from "@sloop-express/misc/loggingNEvent";
import { prisma } from "@sloop-express/misc/prisma";
import { mandatory, procedure, router } from "@sloop-express/misc/trpc";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";

export const agendaRouter = router({
    "list": procedure.input(z.object({ meetingId: z.string() })).query((opts) => {
        return prisma.pointAgenda.findMany({
            where: { meetingId: opts.input.meetingId },
            select: { id: true, name: true, parentId: true }
        })
    }),
    "addPoint": procedure.input(AddAgendaPointSchema).mutation(async opts => {
        return await prisma.$transaction(async tx => {
            const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
            const updated = await tx.meeting.update({
                where: { id: opts.input.meetingId },
                data: {
                    pointAgenda: {
                        create: {
                            id: nanoid(),
                            name: opts.input.name,
                            parent: opts.input.parentId ? { connect: { id: opts.input.parentId } } : undefined
                        }
                    }
                }
            })
            await logNDispatch(tx, "AddAgendaPointSchema", {
                meetingIds: [updated.id],
                userIds: [jwt.user.id]
            }, opts.input, jwt)
            return updated
        })
    }),
    "editPoint": procedure.input(z.object({ meetingId: z.string(), pointId: z.string(), name: z.string() })).mutation(async opts => {
        return await prisma.$transaction(async tx => {
            const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
            const { user } = jwt
            const updated = await tx.meeting.update({
                where: { id: opts.input.meetingId },
                data: {
                    pointAgenda: {
                        update: {
                            where: { id: opts.input.pointId },
                            data: { name: opts.input.name }
                        }
                    }
                }
            })
            await logNDispatch(tx, "EditAgendaPointSchema", {
                meetingIds: [updated.id],
                userIds: [user.id]
            }, opts.input, jwt)
            return updated
        })
    }),
    "deletePoint": procedure.input(DeleteAgendaPointSchema).mutation(async opts => {
        return await prisma.$transaction(async tx => {
            const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
            const { user } = jwt
            //TODO delete sub-point properly
            const updated = await tx.meeting.update({
                where: { id: opts.input.meetingId },
                data: {
                    pointAgenda: {
                        delete: {
                            id: opts.input.pointId
                        }
                    }
                }
            })
            await logNDispatch(tx, "DeleteAgendaPointSchema", {
                meetingIds: [updated.id],
                userIds: [user.id]
            }, opts.input, jwt)
            return updated
        })
    }),
    "startPoint": procedure.input(z.object({ meetingId: z.string(), pointId: z.string() })).mutation(async opts => {
        return await prisma.$transaction(async tx => {
            const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
            const { user } = jwt
            const meeting = await tx.meeting.findUnique({ where: { id: opts.input.meetingId } })
            if (!meeting) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Meeting not found'
                })
            }
            if (meeting.currentAgendaPointId === opts.input.pointId) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Le point est déja actif'
                })
            }
            const updated = await tx.meeting.update({
                where: { id: opts.input.meetingId },
                data: {
                    currentAgendaPoint: { connect: { id: opts.input.pointId } }
                }
            })
            await logNDispatch(tx, "StartPointAgendaSchema", {
                meetingIds: [updated.id],
                userIds: [user.id]
            }, opts.input, jwt)
            return updated
        })
    })
})
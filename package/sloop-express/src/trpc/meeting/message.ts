import { AddMessageSchema, DeleteMessageSchema, EditMessageSchema } from "@sloop-common/sloop_zod/meeting/message";
import { logNDispatch } from "@sloop-express/misc/loggingNEvent";
import { prisma } from "@sloop-express/misc/prisma";
import { mandatory, procedure, router } from "@sloop-express/misc/trpc";
import { nanoid } from "nanoid";

export const messageRouter = router({
    "add": procedure.input(AddMessageSchema).mutation(async opts => {
        //TODO check if user is allowed to add message, it must be a preseder of the meeting ?
        const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
        const { user } = jwt;
        return await prisma.$transaction(async tx => {
            const message = await tx.meetingMessage.create({
                data: {
                    id: nanoid(),
                    meeting: { connect: { id: opts.input.meetingId } },
                    fromUser: { connect: { id: opts.input.userId } },
                    reportedBy: { connect: { id: user.id } },
                    agendaPoint: opts.input.agendaPointId ? { connect: { id: opts.input.agendaPointId } } : undefined,
                    content: opts.input.message,
                }
            })
            await logNDispatch(tx, "AddMessageSchema", {
                meetingIds: [message.meetingId],
                userIds: [message.reportedById, message.fromUserId]
            }, opts.input, jwt)
            return message
        })
    }),
    "update": procedure.input(EditMessageSchema).mutation(async opts => {
        const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
        return await prisma.$transaction(async tx => {
            const message = await tx.meetingMessage.update({
                where: { id: opts.input.messageId, meetingId: opts.input.meetingId },
                data: { content: opts.input.message }
            })
            await logNDispatch(tx, "EditMessageSchema", {
                meetingIds: [message.meetingId],
                userIds: [message.reportedById, message.fromUserId]
            }, opts.input, jwt)
            return message
        })
    }),
    "delete": procedure.input(DeleteMessageSchema).mutation(async opts => {
        const jwt = mandatory(opts.ctx.jwtPayload, "jwt")
        return await prisma.$transaction(async tx => {
            const message = await tx.meetingMessage.update({
                where: { id: opts.input.messageId, meetingId: opts.input.meetingId },
                data: { deletedAt: new Date() }
            })
            await logNDispatch(tx, "EditMessageSchema", {
                meetingIds: [message.meetingId],
                userIds: [message.reportedById, message.fromUserId]
            }, opts.input, jwt)
            return message
        })
    }),
});
import { logNDispatchAnon, meetingEvents, meetingEventsSubscribers, userEvents, votingEvents } from '@sloop-express/misc/loggingNEvent';
import { prisma } from "@sloop-express/misc/prisma";
import { wsProcedure, wsRouter } from "@sloop-express/misc/trpc";
import { parseAccessToken } from "@sloop-express/misc/user";
import { observable } from '@trpc/server/observable';
import { nanoid } from 'nanoid';
import { z } from 'zod';


//TODO garbage collection for subscriptions
export const eventWsRouter = wsRouter({
    "meeting": wsProcedure.input(z.object({ id: z.string(), jwt: z.string().nullable(), appInstanceId: z.string() })).subscription(async (opts) => {
        const jwt = opts.input.jwt != null ? (await parseAccessToken(opts.input.jwt)).value : null
        const { id: meetingId } = opts.input;
        const subscriptionId = nanoid()
        if (jwt) {
            //TODO limit number of subscriptions per user with app instance
            meetingEventsSubscribers.register(meetingId, {
                id: subscriptionId,
                jwtPayload: jwt,
                appInstanceId: opts.input.appInstanceId
            })
            await logNDispatchAnon(prisma, "UserJoinMeetingSchema", { meetingIds: [meetingId], userIds: [] }, { meetingId }, { anonymous: false, jwt: jwt })
        } else {
            meetingEventsSubscribers.register(meetingId, {
                id: subscriptionId,
                jwtPayload: jwt,
                appInstanceId: opts.input.appInstanceId
            })
            await logNDispatchAnon(prisma, "UserJoinMeetingSchema", { meetingIds: [meetingId], userIds: [] }, { meetingId }, { anonymous: true })
        }

        return observable<string>((emit) => {
            const onEvent = (msg: string) => {
                emit.next(msg);
            };
            meetingEvents.on(meetingId, onEvent);
            meetingEvents.listeners(meetingId)

            return async () => {
                meetingEventsSubscribers.unregister(meetingId, subscriptionId)
                if (jwt) {
                    await logNDispatchAnon(prisma, "UserLeftMeetingSchema", { meetingIds: [opts.input.id], userIds: [] }, { meetingId: opts.input.id }, { anonymous: false, jwt: jwt })
                } else {
                    await logNDispatchAnon(prisma, "UserLeftMeetingSchema", { meetingIds: [opts.input.id], userIds: [] }, { meetingId: opts.input.id }, { anonymous: true })
                }
                meetingEvents.off(meetingId, onEvent);
            }
        })
    }),
    "user": wsProcedure.input(z.object({ id: z.string() })).subscription((opts) => {
        const { id: userId } = opts.input;
        return observable<string>((emit) => {
            const onEvent = (msg: string) => {
                emit.next(msg);
            };
            userEvents.on(userId, onEvent);

            return () => {
                userEvents.off(userId, onEvent);
            }
        })
    }),
    "voting": wsProcedure.input(z.object({ id: z.string() })).subscription((opts) => {
        const { id: votingId } = opts.input;
        //TODO handle logAndNotify to track people following voting
        return observable<string>((emit) => {
            const onEvent = (msg: string) => {
                emit.next(msg);
            };
            votingEvents.on(votingId, onEvent);

            return () => {
                votingEvents.off(votingId, onEvent);
            }
        })
    }),
})

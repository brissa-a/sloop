import { Prisma, PrismaClient } from "@sloop-common/prisma";
import { EventEmitter } from 'events';
import { nanoid } from "nanoid";


import { SloopJwtPayload } from "@sloop-common/jwt";
import { toPrismaSuperjson } from "@sloop-common/misc/superjson";
import { PossibleActions } from "@sloop-common/sloop_zod/possibleActions";



type Subscription = {
    id: string,
    jwtPayload: SloopJwtPayload | null,
    appInstanceId: string
}

//TODO replace with a more robust/scalable solution (redis ?)
function buildEventSubscribers() {
    const subscribers: Record<
        string/*meetingId*/, Record<string/*subscriptionId*/, Subscription>
    > = {}
    return {
        subscribers,
        register: (objectId: string, subscription: Subscription) => {
            const objectSubscribers = subscribers[objectId]
            if (objectSubscribers) {
                objectSubscribers[subscription.id] = subscription
            } else {
                subscribers[objectId] = { [subscription.id]: subscription }
            }
        },
        get: (objectId: string, subscriptionId: string) => subscribers[objectId]?.[subscriptionId],
        unregister: (objectId: string, subscriptionId: string) => {
            const objectSubscribers = subscribers[objectId]
            if (objectSubscribers) {
                const { [subscriptionId]: subscription, ...rest } = objectSubscribers
                subscribers[objectId] = rest
            } else {
                console.warn(`Trying to unregister a non existing subscription for ${objectId}`)
            }
        }
    }
}
export const meetingEvents = new EventEmitter();
export const meetingEventsSubscribers = buildEventSubscribers();
export const raisedHands: Record<string, Record<string, Date>> = {}

export const userEvents = new EventEmitter();
export const userEventsSubscribers = buildEventSubscribers();

export const votingEvents = new EventEmitter();
export const votingEventsSubscribers = buildEventSubscribers();

export const groupEvents = new EventEmitter();
export const groupEventsSubscribers = buildEventSubscribers();

export const proposalEvents = new EventEmitter();
export const proposalEventsSubscribers = buildEventSubscribers();

export function cat() {
    return {
        meetingEventsSubscribers: meetingEventsSubscribers.subscribers,
        userEventsSubscribers: userEventsSubscribers.subscribers,
        votingEventsSubscribers: votingEventsSubscribers.subscribers,
        groupEventsSubscribers: groupEventsSubscribers.subscribers,
        proposalEventsSubscribers: proposalEventsSubscribers.subscribers,
        raisedHands
    }
}

export type Concerned = {
    meetingIds?: string[],
    userIds?: string[],
    votingIds?: string[]
    groupIds?: string[]
    proposalIds?: string[]
}

export async function logNDispatch<T extends keyof typeof PossibleActions>(tx: PrismaClient | Prisma.TransactionClient, type: T, concerned: Concerned, data: any, doneBy: SloopJwtPayload) {
    return logNDispatchAnon(tx, type, concerned, data, { anonymous: false, jwt: doneBy })
}

export async function logNDispatchAnon<T extends keyof typeof PossibleActions>(tx: PrismaClient | Prisma.TransactionClient, type: T, concerned: Concerned, data: object, doneBy: { anonymous: false, jwt: SloopJwtPayload } | { anonymous: true }) {
    concerned.meetingIds = concerned.meetingIds || []
    concerned.userIds = concerned.userIds || []
    concerned.votingIds = concerned.votingIds || []
    concerned.groupIds = concerned.groupIds || []
    concerned.proposalIds = concerned.proposalIds || []

    const uniqueConcerned = {
        meetingIds: [...new Set(concerned.meetingIds)],
        userIds: [...new Set(doneBy.anonymous ? concerned.userIds : [doneBy.jwt.user.id, ...concerned.userIds])],//doneBy is always concerned
        votingIds: [...new Set(concerned.votingIds)],
        groupIds: [...new Set(concerned.groupIds)],
        proposalIds: [...new Set(concerned.proposalIds)]
    }

    if (!doneBy.anonymous) {
        //TODO user a generated deviceId as user a user unique identifier when anonymous
        await tx.logEntry.create({
            data: {
                id: nanoid(),
                concernedMeetings: {
                    create: uniqueConcerned.meetingIds.map(id => ({ id: nanoid(), meeting: { connect: { id } } })),
                },
                concernedUsers: {
                    create: uniqueConcerned.userIds.map(id => ({ id: nanoid(), user: { connect: { id } } })),
                },
                concernedVotings: {
                    create: uniqueConcerned.votingIds.map(id => ({ id: nanoid(), voting: { connect: { id } } })),
                },
                concernedGroups: {
                    create: uniqueConcerned.groupIds.map(id => ({ id: nanoid(), group: { connect: { id } } })),
                },
                concernedProposals: {
                    create: uniqueConcerned.proposalIds.map(id => ({ id: nanoid(), proposal: { connect: { id } } })),
                },
                type,
                data: toPrismaSuperjson(data),
                doneBy: { connect: { id: doneBy.jwt.sessionId } }
            }
        })
    }

    for (const meetingId of uniqueConcerned.meetingIds) {
        meetingEvents.emit(meetingId, { type, data })
    }
    for (const userId of uniqueConcerned.userIds) {
        userEvents.emit(userId, { type, data })
    }
    for (const votingId of uniqueConcerned.votingIds) {
        votingEvents.emit(votingId, { type, data })
    }
    for (const groupId of uniqueConcerned.groupIds) {
        groupEvents.emit(groupId, { type, data })
    }
    for (const proposalId of uniqueConcerned.proposalIds) {
        proposalEvents.emit(proposalId, { type, data })
    }
}

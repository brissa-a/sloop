

//TODO replace with a more robust/scalable solution (kafka ?)
import { faker } from '@faker-js/faker';
import { Prisma } from '@sloop-common/prisma';
import { prisma } from '@sloop-express/misc/prisma';
import { appRouter } from '@sloop-express/trpc';
import cron from 'node-cron';
import { createCallerFactory } from './trpc';
import { createSession } from './user';
import { basicVotingInclude } from './voting';

const createCaller = createCallerFactory(appRouter);

const session = await createSession(
    prisma,
    {
        userId: 'sloop-bot',
        principalId: 'sloop-bot',
        keepMeLoggedIn: true,//We dont care about this
        isAdmin: true
    }
)

const caller = createCaller({
    isLocalCall: true,
    jwtPayload: {
        user: {
            id: 'sloop-bot',
            avatarUrl: faker.image.avatar(),
            username: 'Sloop bot',
            slug: 'sloop-bot',
            isAdmin: true,
            confidential: null,
            groupMembership: []
        },
        principal: {
            id: 'sloop-bot',
            avatarUrl: faker.image.avatar(),
            username: 'Sloop bot',
            slug: 'sloop-bot',
            isAdmin: true,
            confidential: null,
            groupMembership: []
        },
        sessionId: session.id,
        isAdmin: true
    }
});

type ScheduledTaskDef = {
    date: Date,
    procedure: string,
    params: string,
    run: () => Promise<void>
}
let tasksByExecutionDate: Record<string, ScheduledTaskDef[]> = {}
refresh()//Initial refresh


function notYetStartedOrEndedVotingSelect(): Prisma.VotingWhereInput {
    return {
        autoStartEnd: true,
        OR: [
            { actualStartAt: null },
            { actualEndAt: null }
        ]
    }
}

export function catScheduler() {
    return tasksByExecutionDate
}

const roundToMinutes = (date: Date) => {
    const rounded = new Date(date)
    rounded.setSeconds(0, 0);
    return rounded;
};

export async function refresh() {
    console.log("Refreshing schedules")
    tasksByExecutionDate = {}
    const votings = await prisma.voting.findMany({
        where: notYetStartedOrEndedVotingSelect(),
        include: basicVotingInclude
    })
    for (const voting of votings) {
        const params = {
            votingId: voting.id
        }

        //Schedule start
        if (voting.actualStartAt === null) {
            addScheduledTask({
                procedure: 'meeting.voting.start',
                date: voting.scheduledStartAt,
                params: JSON.stringify(params),
                run: async () => {
                    caller.meeting.voting.start(params)
                }
            })
        }

        //Schedule end
        if (voting.actualEndAt === null) {
            addScheduledTask({
                procedure: 'meeting.voting.end',
                date: voting.scheduledEndAt,
                params: JSON.stringify(params),
                run: async () => {
                    caller.meeting.voting.end(params)
                }
            })
        }
    }
}

function addScheduledTask(taskDef: ScheduledTaskDef) {
    const rounded = roundToMinutes(taskDef.date)
    if (rounded < new Date()) {
        console.log("Missed task fired immediatly", taskDef)
        taskDef.run().catch(console.error)
    } else {
        const dateStr = rounded.toISOString()
        tasksByExecutionDate[dateStr] = tasksByExecutionDate[dateStr] || []
        tasksByExecutionDate[dateStr]!.push(taskDef)
    }
}

export function startScheduler() {
    console.log("Scheduler started")
    cron.schedule('* * * * *', () => {
        const dateStr = roundToMinutes(new Date()).toISOString()
        console.debug('Scheduler tick', dateStr)
        const tasks = tasksByExecutionDate[dateStr]
        for (const task of tasks || []) {
            console.log("Running task", task.procedure, task.params)
            task.run().catch(console.error)
        }
    })
}
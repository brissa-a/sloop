import { router, wsRouter } from '@sloop-express/misc/trpc';
import { userRouter } from './user';
import { groupRouter } from './group';
import { proposalRouter } from './proposal';
import { meetingRouter } from './meeting';
import { eventWsRouter } from './events';
import { unseenRouter } from './unseen';


export const appRouter = router({
    user: userRouter,
    proposal: proposalRouter,
    group: groupRouter,
    meeting: meetingRouter,
    unseen: unseenRouter
})

export type AppRouter = typeof appRouter;

export const appWsRouter = wsRouter({
    event: eventWsRouter,
})

export type AppWsRouter = typeof appWsRouter;


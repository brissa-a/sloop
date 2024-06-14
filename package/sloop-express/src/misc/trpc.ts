
import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';

import { SloopJwtPayload } from '@sloop-common/jwt';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws';
import { prisma } from './prisma';
import { parseJwtPayloadDetailed } from './user';

type SloopTrpcContext = {
    isLocalCall: false
    req: CreateExpressContextOptions['req'];
    res: CreateExpressContextOptions['res'];
    jwtPayloadDetailed: Awaited<ReturnType<typeof parseJwtPayloadDetailed>>;
    jwtPayload: SloopJwtPayload | null;
} | {
    isLocalCall: true,
    jwtPayload: SloopJwtPayload
}

//
// Classic HTTP context
//
export const createContext = async ({ req, res }: CreateExpressContextOptions): Promise<SloopTrpcContext> => {
    const jwtPayloadDetailed = await parseJwtPayloadDetailed(prisma, req, res)
    return {
        isLocalCall: false,
        req,
        res,
        jwtPayloadDetailed,
        jwtPayload: jwtPayloadDetailed.payload.value
    };
};

const t = initTRPC.context<SloopTrpcContext>().create({
    transformer: superjson
});
export const router = t.router;
export const procedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

// 
// WebSocket context
//
export const createWsContext = async ({ /*req, res*/ }: CreateWSSContextFnOptions) => {
    return {};
}
const tWs = initTRPC.context<typeof createWsContext>().create({
    transformer: superjson
});
export const wsRouter = tWs.router;
export const wsProcedure = tWs.procedure;

export function mandatory<T>(data: T | null | undefined, name: string): T {
    if (!data) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: `${name} is mandatory`
        })
    }
    return data
}

export function mandatoryUser(user: SloopJwtPayload['user'] | null | undefined): SloopJwtPayload['user'] {
    if (!user) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to perform this action'
        })
    }
    return user
}
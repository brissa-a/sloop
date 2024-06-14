import { procedure, router } from '@sloop-express/misc/trpc';
import { prisma } from '@sloop-express/misc/prisma';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

//Dont forget to add your router to src/trpc/index.ts:

export const userRouter = router({
    "sayHello": procedure.input(z.object({
        email: z.string(),
    })).query(async (opts) => {
        const possibleUsers = await prisma.user.findMany({
            where: {
                confidential: {
                    email: opts.input.email
                }
            }
        })
        if (possibleUsers.length === 0) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
        if (possibleUsers.length > 1) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Multiple users found' })
        const user = possibleUsers[0]
        if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
        return `Hello, ${user.username}`
    }),
})
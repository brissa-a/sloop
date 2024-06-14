import config from '@sloop-express/config';
import { prisma } from '@sloop-express/misc/prisma';
import { mandatory, mandatoryUser, procedure, router } from '@sloop-express/misc/trpc';
import { createSession, generateAccessToken, getSession, verifyPassword } from '@sloop-express/misc/user';
import { TRPCError } from '@trpc/server';
import ms from 'ms';
import { z } from 'zod';
import { membershipRouter } from './user/membership';
import { LoginSchema } from '@sloop-common/sloop_zod/user';

export const userRouter = router({
    "membership": membershipRouter,
    "am-i-logged": procedure.query(async (opts) => {
        if (opts.ctx.isLocalCall) return;
        const jwtPayload = opts.ctx.jwtPayload
        if (!jwtPayload) {
            const empty = {
                payload: null,
                session: null,
                wasRefreshed: false,
                wasCleared: false,
                validFor: null,
                willBeRefreshedIn: null,
            }
            return empty
        }
        const session = await getSession(prisma, jwtPayload.sessionId);
        const { didClear, didRefresh, payload } = opts.ctx.jwtPayloadDetailed
        let validFor = null
        let willBeRefreshedIn = null
        if (payload.value?.iat) {
            const iat = payload.value.iat * 1000
            willBeRefreshedIn = ms(iat + ms(config.JWT_DURATION()))
            if (session?.createdAt) {
                validFor = ms(session.createdAt.getTime() + ms(config.SESSION_DURATION()))
            }
        }
        return {
            payload: payload.value,
            session,
            wasRefreshed: didRefresh,
            wasCleared: didClear,
            validFor: validFor,
            willBeRefreshedIn: willBeRefreshedIn,
        }
    }),
    "logAs": procedure.input(z.object({ substitutedUserId: z.string(), forwardAdmin: z.boolean() })).mutation(async ({ input, ctx }) => {
        if (ctx.isLocalCall) return;
        const { res } = ctx
        const principalJwt = mandatoryUser(ctx.jwtPayload?.principal)
        const principalUser = await prisma.user.findUnique({
            where: { id: principalJwt.id },
            include: {
                groupMembership: { select: { role: true, group: { select: { slug: true, id: true } } } },
                confidential: true
            }
        });
        if (!principalUser || !principalUser.isAdmin) {
            throw new TRPCError({ code: "FORBIDDEN" });
        }
        const substitutedUser = await prisma.user.findUnique({
            where: { id: input.substitutedUserId },
            include: {
                groupMembership: { select: { role: true, group: { select: { slug: true, id: true } } } },
                confidential: true,
            }
        });
        if (!substitutedUser) {
            throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }
        await prisma.$transaction(async tx => {
            const session = await createSession(tx, {
                userId: substitutedUser.id,
                principalId: principalUser.id,
                keepMeLoggedIn: false,
                isAdmin: input.forwardAdmin && principalUser.isAdmin,
            });

            const token = await generateAccessToken(tx, {
                principal: principalUser,
                user: substitutedUser,
                isAdmin: input.forwardAdmin && session.isAdmin,
                sessionId: session.id,
                reason: "LOGIN",
            });
            res.setHeader("Set-Authorization-Bearer", token)
        })
        return
    }),
    "login": procedure.input(LoginSchema).mutation(async ({ input, ctx }) => {
        if (ctx.isLocalCall) return;
        const { res } = ctx
        const forbidden = () => {
            throw new TRPCError({ code: "FORBIDDEN", message: "Invalid username or password" });
        }
        const { id, password, keepMeLoggedIn, forwardAdmin } = input;
        const possibleUsers = await prisma.user.findMany({
            where: {
                OR: [
                    { username: id },
                    {
                        confidential: {
                            email: id
                        }
                    },
                ]
            },
            include: { confidential: true, groupMembership: { select: { role: true, group: { select: { slug: true, id: true } } } } }
        });
        if (possibleUsers.length !== 1) return forbidden();
        const user = possibleUsers[0];
        if (!user || !user.confidential!.passwordHash) return forbidden();
        const validPassword = verifyPassword(password, user.confidential!.passwordHash);
        if (!validPassword) return forbidden();
        await prisma.$transaction(async tx => {
            const session = await createSession(tx, {
                userId: user.id,
                principalId: user.id,
                keepMeLoggedIn: keepMeLoggedIn ?? false,
                isAdmin: forwardAdmin ?? user.isAdmin,
            });
            const token = await generateAccessToken(tx, {
                principal: user,
                user: user,
                sessionId: session.id,
                isAdmin: forwardAdmin ?? user.isAdmin,
                reason: "LOGIN",
            });
            res.setHeader("Set-Authorization-Bearer", token)
        })
        return
    }),

    "logout": procedure.mutation(async ({ ctx }) => {
        if (ctx.isLocalCall) return;
        const { res } = ctx
        const sessionId = ctx.jwtPayload?.sessionId

        if (sessionId) {
            await prisma.session.update({
                where: {
                    id: sessionId
                },
                data: { deletedAt: new Date() }
            })
        } else {
            throw new TRPCError({ code: "FORBIDDEN", message: "You are not logged in or your token is invalid" });
        }
        res.setHeader("Set-Authorization-Bearer", "")
        return
    }),
    "list": procedure.query((opts) => {
        mandatory(opts.ctx.jwtPayload, "jwt")
        return prisma.user.findMany({
            select: {
                id: true,
                username: true,
                avatarUrl: true,
                slug: true,
            }
        })
    }),
    "byId": procedure.input(z.object({ id: z.string() })).query(opts => {
        return prisma.user.findUnique({
            where: { id: opts.input.id },
            include: {
                _count: {
                    select: {
                        copiedBy: {
                            where: {
                                groupId: 'assemblee-permanente'
                            }
                        },
                    }
                },
                groupMembership: {
                    include: {
                        group: {
                            select: {
                                id: true,
                                slug: true,
                                copies: {
                                    where: {
                                        OR: [
                                            { copierId: opts.input.id },
                                            { copiedId: opts.input.id }
                                        ]
                                    },
                                    select: {
                                        power: true,
                                        copiedId: true,
                                        copierId: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
    })
})
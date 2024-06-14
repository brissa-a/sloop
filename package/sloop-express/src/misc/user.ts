import { ago } from '@sloop-common/misc/date';
import { Prisma, PrismaClient } from "@sloop-common/prisma";
import * as argon2 from 'argon2';
import { Request, Response } from 'express';
import { IncomingHttpHeaders } from "http2";
import jwt from "jsonwebtoken";
import { nanoid } from 'nanoid';
import type { SloopJwtPayload, SloopOnlyJwtPayload, UserJwtPayload } from 'sloop-common/jwt';
import { SloopJwtPayloadSchema, UserJwtPayloadSchema } from 'sloop-common/jwt';
import { GeneratedReason, Session, User } from "sloop-common/prisma.js";
import { Missing, Optional, Present, empty, present } from 'sloop-common/types';
import util from 'util';
import config from "../config";
import slugify from 'slugify';
import { hash as argon2Hash } from 'argon2';
import { faker } from '@faker-js/faker';

const verifyJwt = (accessToken: string, jwtSecret: string) => util.promisify(x => jwt.verify(accessToken, jwtSecret, x))();

export async function parseJwtPayload(tx: PrismaClient, req: Request, res: Response): Promise<Optional<SloopJwtPayload>> {
    const { payload: maybePayload } = await parseJwtPayloadDetailed(tx, req, res)
    if (maybePayload.value) {
        return present(maybePayload.value)
    } else {
        return empty(maybePayload.cause)
    }
}

export async function parseAccessToken(accessToken: string): Promise<Optional<SloopJwtPayload>> {
    let payload
    try {
        payload = await verifyJwt(accessToken, config.JWT_SECRET())
            .then(SloopJwtPayloadSchema.parse);
    } catch (e) {
        return empty('Invalid access token');
    }
    if (!payload.iat) return empty('No iat in jwt payload');
    if (payload.iat < ago(config.JWT_DURATION()).getTime() / 1000) {
        return empty('Token expired');
    } else {
        return present(payload);
    }
}

export async function parseJwtPayloadDetailed(tx: PrismaClient, req: { headers: IncomingHttpHeaders }, res: Response): Promise<{ didClear: boolean, didRefresh: boolean, payload: Optional<SloopJwtPayload> }> {
    const accessToken = req.headers['authorization']?.split('Bearer ')[1];
    if (!accessToken) return keepAuth(empty('No access token in headers'))
    let payload
    try {
        payload = await verifyJwt(accessToken, config.JWT_SECRET())
            .then(SloopJwtPayloadSchema.parse);
    } catch (e) {
        return clearAuth(res, empty('Invalid access token'));
    }
    if (!payload.iat) return clearAuth(res, empty('No iat in jwt payload'));
    if (payload.iat < ago(config.JWT_DURATION()).getTime() / 1000) {
        const maybeSession = await canIRefreshAccessToken(tx, payload)
        if (maybeSession.value) {
            return refreshAuth(tx, res, present(payload));
        } else {
            return clearAuth(res, empty(maybeSession.cause));
        }
    } else {
        return keepAuth(present(payload));
    }
}

async function refreshAuth(tx: PrismaClient, res: Response, payload: Present<SloopJwtPayload>) {
    const newAccessToken = await generateAccessToken(tx, {
        user: payload.value.user,
        principal: payload.value.principal,
        isAdmin: payload.value.isAdmin,
        sessionId: payload.value.sessionId,
        "reason": "REFRESH",
    });
    res.header('Set-Authorization-Bearer', newAccessToken)
    return { didClear: false, didRefresh: true, payload: payload };
}

function clearAuth(res: Response, payload: Missing) {
    res.header('Set-Authorization-Bearer', '')
    return { didClear: true, didRefresh: false, payload };
}

function keepAuth(payload: Optional<SloopJwtPayload>) {
    return { didClear: false, didRefresh: false, payload };
}


export async function createUser(tx: PrismaClient, username: string, email: string, password: string): Promise<User> {
    const id = nanoid();
    const user = await tx.user.create({
        data: {
            id,
            username: username,
            slug: slugify(username, { lower: true, strict: true }),
            isAdmin: false,
            confidential: {
                create: {
                    id: nanoid(),
                    email: email,
                    passwordHash: await argon2Hash(password)
                }
            },
            avatarUrl: faker.image.avatar(),
        }
    });
    return user
}

export function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return argon2.verify(passwordHash, password);
}

export async function generateAccessToken(tx: PrismaClient | Prisma.TransactionClient, opt: { user: UserJwtPayload, principal: UserJwtPayload, sessionId: string, reason: GeneratedReason, isAdmin: boolean }): Promise<string> {
    const { user, principal, sessionId, reason, isAdmin } = opt
    const payload: SloopOnlyJwtPayload = {
        sessionId,
        //Parse to clean user object to avoid leaking confidential extra field 
        user: UserJwtPayloadSchema.parse(user),
        principal: UserJwtPayloadSchema.parse(principal),
        isAdmin
    }
    await tx.accessTokenGenerated.create({
        data: {
            id: nanoid(),
            reason,
            session: {
                connect: {
                    id: sessionId
                }
            }
        }
    })
    return jwt.sign(payload, config.JWT_SECRET());
}

export function createSession(tx: PrismaClient | Prisma.TransactionClient, opt: { userId: string, principalId: string, keepMeLoggedIn: boolean, isAdmin: boolean }) {
    const { userId, principalId, keepMeLoggedIn, isAdmin } = opt
    return tx.session.create({
        data: {
            id: nanoid(),
            user: {
                connect: {
                    id: userId,
                },
            },
            principal: {
                connect: {
                    id: principalId,
                }
            },
            isAdmin,
            keepMeLoggedIn,
        },
    });
}


async function canIRefreshAccessToken(tx: PrismaClient, jwtPayload: SloopJwtPayload): Promise<Optional<Session>> {
    const sessionId = jwtPayload.sessionId;
    if (!sessionId) return empty('No session token in cookies');
    const session = await getSession(tx, sessionId);
    if (!session) return empty('No session associated with session token');
    if (session.keepMeLoggedIn) {
        if (!session.latestAccessToken) return present(session)
        if (session.latestAccessToken.createdAt < ago(config.SESSION_DURATION())) {
            return empty('Session expired')
        }
    } else {
        if (session.createdAt < ago(config.SESSION_DURATION())) {
            return empty('Session expired')
        }
    }
    return present(session)
}


export async function getSession(tx: PrismaClient | Prisma.TransactionClient, sessionId: string) {
    const session = await tx.session.findUnique({
        where: {
            id: sessionId,
            deletedAt: null
        },
        include: {
            accessTokenGenerated: {
                orderBy: {
                    createdAt: 'desc'
                },
                take: 1
            }
        }
    })
    if (!session) return null
    return {
        id: session.id,
        createdAt: session.createdAt,
        deletedAt: session.deletedAt,
        keepMeLoggedIn: session.keepMeLoggedIn,
        userId: session.userId,
        latestAccessToken: session.accessTokenGenerated[0],
        principalId: session.principalId,
        isAdmin: session.isAdmin
    }
}
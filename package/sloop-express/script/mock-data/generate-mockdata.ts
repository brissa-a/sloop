import { faker } from '@faker-js/faker';

import { pickRandomSizeSlice, shuffleArray } from '@sloop-common/misc/array';
import { _throw } from '@sloop-common/misc/misc';
import { $Enums, Group } from '@sloop-common/prisma';
import { validMembershipByUser } from '@sloop-express/misc/membership';
import { printProgress } from '@sloop-express/misc/misc';
import { prisma } from '@sloop-express/misc/prisma';
import { hash as argon2Hash } from 'argon2';
import ms from 'ms';
import { nanoid } from 'nanoid';
import slugify from 'slugify';
import groupNames from './group-names.json';
import { deleteCascadeVote } from '@sloop-express/misc/vote';
import { VOTE_BASE_POWER, basicVotingInclude, initializeCopivote } from '@sloop-express/misc/voting';

type Membership = {
    readonly userId: string;
    readonly role: "MEMBER";
} | {
    readonly userId: string;
    readonly role: "CAPTAIN";
}

//pnpm script script/mock-data/generate-mockdata.ts
async function main() {

    const adminUser = await createAdminUser();

    await createBotUser();

    const adminSession = await createAdminSession(adminUser);

    const users = [];
    for (let i = 0; i < 100; i++) {
        printProgress(i, 100, 'Creating users')
        const username = faker.internet.userName();
        const { user, session } = await createUserAndSession(i, username);
        users.push({ user, session });
    }
    console.log();

    const groups = [];
    for (const name of groupNames) {
        printProgress(groups.length, groupNames.length, 'Creating groups');
        const group = await createGroupAndDelegation(name, users);
        groups.push(group)
    }
    console.log();

    for (let i = 0; i < 100; i++) {
        printProgress(i, 100, 'Creating meetings')
        await createMeeting(i, adminSession, groups);
    }
    console.log();

    const group = groups[0]!;
    const [voterUserId, voterValidMemberships] = shuffleArray(validMembershipByUser(group.memberships))[0]!;

    await createExampleMeetingAndVoting(adminSession.id, group, voterUserId, voterValidMemberships[0]!.id);
}

async function createMeeting(i: number, adminSession: { id: string; createdAt: Date; deletedAt: Date | null; keepMeLoggedIn: boolean; userId: string; principalId: string | null; isAdmin: boolean; }, groups: ({ memberships: { id: string; role: $Enums.GroupMembershipRole; groupId: string; userId: string; startDate: Date; expirationDate: Date | null; }[]; } & { id: string; name: string; slug: string; description: string | null; requireJoinValidation: boolean; requireLeaveValidation: boolean; joinConditionMd: string; leaveConditionMd: string; })[]) {
    let scheduledStartAt;
    if (Math.random() > 0.5) {
        scheduledStartAt = faker.date.recent({
            days: 90,
        });
    } else {
        scheduledStartAt = faker.date.soon({
            days: 90,
        });
    }

    const scheduledEndAt = faker.date.soon({
        refDate: scheduledStartAt,
    });
    const title = faker.lorem.sentence();
    const slug = slugify(title, { lower: true, strict: true });
    await prisma.meeting.create({
        data: {
            id: "fake-meeting-id-" + i,
            slug,
            title,
            description: faker.lorem.paragraph(),
            location: 'somewhere over the rainbow',
            scheduledStartAt: scheduledStartAt,
            scheduledEndAt: scheduledEndAt,
            createdAt: faker.date.recent(),
            createdById: adminSession.id,
            groupId: shuffleArray(groups)[0]?.id || _throw('No groups'),
        }
    });
}

async function createGroupAndDelegation(name: string, users: { user: { id: string; username: string | null; slug: string | null; avatarUrl: string | null; isAdmin: boolean; }; session: { id: string; createdAt: Date; deletedAt: Date | null; keepMeLoggedIn: boolean; userId: string; principalId: string | null; isAdmin: boolean; }; }[]) {
    try {
        const selectUsers = name === "Assemblée permanente" ? users : pickRandomSizeSlice(shuffleArray(users), 1, 30);
        const members = selectUsers
            .map(user => user.user.id)
            .map(id => ({ userId: id, role: 'MEMBER' } as const));
        const captains = pickRandomSizeSlice(members, 1, 3)
            .map(({ userId }) => ({ userId, role: 'CAPTAIN' } as const));
        console.log('connecting to members', members.length, 'captains', captains.length);
        const membership: Membership[] = [...members, ...captains];
        //Create group and default voting group
        const group = await createGoup(name, membership);
        await creatRandomDelegation(group, group.memberships);

        //Admin is member of all groups
        // const adminGroupMembership = await joinToGroup(group.id, adminUser.id);
        // const defaultVotingGroupMembership = await joinToVotingGroup(defaultgroup.id, adminUser.id);
        return group

    } catch (error) {
        console.error('for group', name);
        throw error;
    }
}

async function createUserAndSession(i: number, username: string) {
    const user = await prisma.user.create({
        data: {
            id: "fake-user-id-" + i,
            username,
            isAdmin: false,
            slug: slugify(username, { lower: true }),
            confidential: {
                create: {
                    id: nanoid(),
                    email: faker.internet.email(),
                    passwordHash: await argon2Hash("password")
                }
            },
            avatarUrl: faker.image.avatar(),
        }
    });
    const session = await prisma.session.create({
        data: {
            id: "fake-session-id-" + i,
            createdAt: faker.date.recent(),
            keepMeLoggedIn: true,
            isAdmin: true,
            principal: {
                connect: {
                    id: user.id,
                }
            },
            user: {
                connect: {
                    id: user.id,
                }
            }
        }
    });
    return { user, session };
}

async function createAdminSession(adminUser: { id: string; username: string | null; slug: string | null; avatarUrl: string | null; isAdmin: boolean; }) {
    return await prisma.session.create({
        data: {
            id: "fake-admin-session-id",
            createdAt: faker.date.recent(),
            keepMeLoggedIn: true,
            isAdmin: true,
            principal: {
                connect: {
                    id: adminUser.id,
                }
            },
            user: {
                connect: {
                    id: adminUser.id,
                }
            }
        }
    });
}

async function createBotUser() {
    return await prisma.user.create({
        data: {
            id: "sloop-bot",
            username: 'Sloop bot',
            slug: 'sloop-bot',
            isAdmin: true,
            avatarUrl: faker.image.avatar(),
        }
    });
}

async function createAdminUser() {
    return await prisma.user.create({
        data: {
            id: "fake-admin-id",
            username: 'admin',
            slug: 'admin',
            isAdmin: true,
            confidential: {
                create: {
                    id: nanoid(),
                    email: 'admin@test.com',
                    passwordHash: await argon2Hash("admin")
                }
            },
            avatarUrl: faker.image.avatar(),
        }
    });
}

async function createExampleMeetingAndVoting(
    sessionId: string,
    group: Awaited<ReturnType<typeof createGoup>>,
    voterId: string,
    membershipId: string
) {
    const title = "Réunion d'exemple";
    const scheduledStartAt = new Date();
    const createdAt = new Date(scheduledStartAt.getTime() - ms('1d'));
    const scheduledEndAt = new Date(Date.now() + ms('8h'));
    const slug = slugify(title, { lower: true, strict: true });

    const exampleMeeting = await prisma.meeting.create({
        include: {
            voting: {
                include: basicVotingInclude,
            },
        },
        data: {
            id: "example-meeting-id",
            slug,
            title,
            description: faker.lorem.paragraph(),
            location: 'somewhere over the rainbow',
            scheduledStartAt,
            scheduledEndAt,
            createdAt,
            createdBy: { connect: { id: sessionId } },
            group: { connect: { id: group.id } },
            voting: {
                create: [{
                    id: "single-name-voting-id",
                    name: 'Uninominal exemple',
                    slug: slugify('Uninominal exemple', { lower: true, strict: true }),
                    votingMethodParams: '{}',
                    votingMethod: 'SINGLE_NAME',
                    scheduledStartAt: scheduledStartAt,
                    actualStartAt: scheduledStartAt,
                    scheduledEndAt: scheduledEndAt,
                    autoStartEnd: true,
                    group: { connect: { id: group.id } },
                    description: faker.lorem.paragraph(),
                    startedBySession: { connect: { id: sessionId } },
                    createdBy: { connect: { id: sessionId } },
                    choices: {
                        create: [
                            { id: 'single-name-1', name: 'Candidat 1' },
                            { id: 'single-name-2', name: 'Candidat 2' },
                            { id: 'single-name-3', name: 'Candidat 3' },
                            { id: 'single-name-4', name: 'Candidat 4' },
                            { id: 'single-name-5', name: 'Candidat 5' },
                            { id: 'single-name-6', name: 'Candidat 6' },
                        ]
                    }
                }, {
                    id: "approval-voting-id",
                    name: 'Approbation exemple',
                    slug: slugify('Approbation exemple', { lower: true, strict: true }),
                    votingMethodParams: '{}',
                    votingMethod: 'APPROVAL',
                    scheduledStartAt: scheduledStartAt,
                    actualStartAt: scheduledStartAt,
                    scheduledEndAt: scheduledEndAt,
                    autoStartEnd: true,
                    group: { connect: { id: group.id } },
                    description: faker.lorem.paragraph(),
                    startedBySession: { connect: { id: sessionId } },
                    createdBy: { connect: { id: sessionId } },
                    choices: {
                        create: [
                            { id: 'approval-1', name: 'Candidat 1' },
                            { id: 'approval-2', name: 'Candidat 2' },
                            { id: 'approval-3', name: 'Candidat 3' },
                            { id: 'approval-4', name: 'Candidat 4' },
                            { id: 'approval-5', name: 'Candidat 5' },
                            { id: 'approval-6', name: 'Candidat 6' },
                        ]
                    },
                }, {
                    id: "jm-voting-id",
                    name: 'Jugement majoritaire exemple',
                    slug: slugify('Jugement majoritaire exemple', { lower: true, strict: true }),
                    votingMethodParams: '{}',
                    votingMethod: 'JUGEMENT_MAJORITAIRE',
                    scheduledStartAt: scheduledStartAt,
                    actualStartAt: scheduledStartAt,
                    scheduledEndAt: scheduledEndAt,
                    autoStartEnd: true,
                    group: { connect: { id: group.id } },
                    description: faker.lorem.paragraph(),
                    startedBySession: { connect: { id: sessionId } },
                    createdBy: { connect: { id: sessionId } },
                    choices: {
                        create: [
                            { id: 'jm-1', name: 'Candidat 1' },
                            { id: 'jm-2', name: 'Candidat 2' },
                            { id: 'jm-3', name: 'Candidat 3' },
                            { id: 'jm-4', name: 'Candidat 4' },
                            { id: 'jm-5', name: 'Candidat 5' },
                            { id: 'jm-6', name: 'Candidat 6' },
                        ]
                    }
                }]
            }
        }
    });

    for (const voting of exampleMeeting.voting) {
        await initializeCopivote(prisma, sessionId, voting);
    }
    //Delete copyvote of the voter
    await deleteCascadeVote(prisma, voterId, { votingVoteScore: true })

    await prisma.votingVote.create({
        data: {
            id: nanoid(),
            ofVotingId: 'single-name-voting-id',
            createdById: sessionId,
            voterId: voterId,
            validVoterMembershipId: membershipId,
            power: VOTE_BASE_POWER,
            scores: {
                create: [
                    { id: nanoid(), forChoiceId: 'single-name-1', score: 'Pour' },
                    { id: nanoid(), forChoiceId: 'single-name-2', score: 'Contre' },
                    { id: nanoid(), forChoiceId: 'single-name-3', score: 'Contre' },
                    { id: nanoid(), forChoiceId: 'single-name-4', score: 'Contre' },
                    { id: nanoid(), forChoiceId: 'single-name-5', score: 'Contre' },
                    { id: nanoid(), forChoiceId: 'single-name-6', score: 'Contre' },
                ]
            },
        }
    });

    await prisma.votingVote.create({
        data: {
            id: nanoid(),
            ofVotingId: 'approval-voting-id',
            createdById: sessionId,
            voterId: voterId,
            validVoterMembershipId: membershipId,
            power: VOTE_BASE_POWER,
            scores: {
                create: [
                    { id: nanoid(), forChoiceId: 'approval-1', score: 'Pour' },
                    { id: nanoid(), forChoiceId: 'approval-2', score: 'Contre' },
                    { id: nanoid(), forChoiceId: 'approval-3', score: 'Pour' },
                    { id: nanoid(), forChoiceId: 'approval-4', score: 'Pour' },
                    { id: nanoid(), forChoiceId: 'approval-5', score: 'Contre' },
                    { id: nanoid(), forChoiceId: 'approval-6', score: 'Contre' },
                ]
            },
        }
    });

    await prisma.votingVote.create({
        data: {
            id: nanoid(),
            ofVotingId: 'jm-voting-id',
            createdById: sessionId,
            voterId: voterId,
            validVoterMembershipId: membershipId,
            power: VOTE_BASE_POWER,
            scores: {
                create: [
                    { id: nanoid(), forChoiceId: 'jm-1', score: 'Trés bien' },
                    { id: nanoid(), forChoiceId: 'jm-2', score: 'Assez bien' },
                    { id: nanoid(), forChoiceId: 'jm-3', score: 'A rejeter' },
                    { id: nanoid(), forChoiceId: 'jm-4', score: 'Bien' },
                    { id: nanoid(), forChoiceId: 'jm-5', score: 'Passable' },
                    { id: nanoid(), forChoiceId: 'jm-6', score: 'Insuffisant' },
                ]
            },
        }
    });
}

export async function joinToGroup(groupId: string, userId: string) {
    return await prisma.groupMembership.create({
        data: {
            id: nanoid(),
            startDate: faker.date.recent(),
            groupId,
            userId,
            role: 'CAPTAIN',
        }
    })
}

async function createGoup(name: string, membership: Membership[]) {
    return prisma.group.create({
        include: {
            memberships: true,
        },
        data: {
            id: slugify(name, { lower: true }).slice(0, 20),
            name: capitalizeFirstLetter(name),
            slug: slugify(name, { lower: true }),
            description: faker.lorem.paragraph(),
            memberships: {
                create: membership.map(({ userId, role }) => ({
                    id: nanoid(),
                    role: role,
                    startDate: faker.date.recent(),
                    user: {
                        connect: {
                            id: userId,
                        }
                    }
                }))
            },
            joinConditionMd: faker.lorem.paragraph(),
            leaveConditionMd: faker.lorem.paragraph(),
            requireJoinValidation: name === "Assemblée permanente",
            requireLeaveValidation: name === "Assemblée permanente",
        }
    });
}

async function creatRandomDelegation(group: Group, memberships: {
    id: string;
    role: $Enums.GroupMembershipRole;
    groupId: string;
    userId: string;
    startDate: Date;
    expirationDate: Date | null;
}[]) {

    const copies = [];
    const members = validMembershipByUser(memberships);
    for (let i = 0; i < members.length; i++) {
        console.log('Creating delegations', i, 'of', members.length)
        const [userId,] = members[i]!;
        const [nextUserId,] = members[(i + 1) % members.length]!;
        // const data = {
        //     id: nanoid(),
        //     copierId: userId,
        //     copiedId: nextUserId,
        //     groupId: group.id,
        //     power: 90,
        // }
        // copies.push(data);

        const shuffled = shuffleArray(members.filter(x => x[0] !== userId && x[0] !== nextUserId))
        let consumedPower = 0;
        let next = true
        while (next && shuffled.length > 0) {
            const [delegatedTo,] = shuffled.pop()!;
            let power = Math.random() * (100 - consumedPower);
            if (power < 1) {
                power = 100 - consumedPower;
            }
            consumedPower += power;
            if (consumedPower >= 100) {
                next = false;
            } else {
                copies.push({
                    id: nanoid(),
                    copierId: userId,
                    copiedId: delegatedTo,
                    groupId: group.id,
                    power: power,
                });
            }

        }
        // for (const delegatedTo of delegatedTos) {
        //     copies.push({
        //         id: nanoid(),
        //         copierId: userId,
        //         copiedId: delegatedTo[0]!,
        //         groupId: group.id,
        //         power: 1,
        //     });
        // }
    }

    const duplicates = copies.filter((copy, index, self) => {
        return (
            index !== self.findIndex((d) =>
                d.copierId === copy.copierId &&
                d.copiedId === copy.copiedId &&
                d.groupId === copy.groupId
            )
        );
    });

    console.log('Duplicates:', duplicates);
    // if (delegations.length > 0) {
    //     console.log('Delegations:', delegations[0]);
    //     await prisma.votingGroupDelegation.create({
    //         data: delegations[0]!
    //     })
    // }
    await prisma.groupCopy.createMany({
        data: copies
    });
}

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

main().catch(console.error).finally(() => prisma.$disconnect());


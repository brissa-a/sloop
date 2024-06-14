import { ActionIcon, Alert, Avatar, Box, Card, Center, Group, List, Stack, Text, Title } from "@mantine/core";

import frLocale from '@fullcalendar/core/locales/fr';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import { useLocalStorage } from "@mantine/hooks";
import { UserJwtPayload } from "@sloop-common/jwt";
import { VOTE_BASE_POWER } from "@sloop-express/misc/voting";
import { AddCopyAction } from "@sloop-vite/component/group/AddCopyAction";
import { DelCopyAction } from "@sloop-vite/component/group/DelCopyAction";
import { SloopAvatar } from "@sloop-vite/component/user/Avatar";
import { InlineUser } from "@sloop-vite/component/user/InlineUser";
import { useSloop } from "@sloop-vite/hooks/sloop";
import { chunkArray } from "@sloop-vite/misc/array";
import { TrpcOut, trpcReact } from "@sloop-vite/misc/trpc";
import { IconAlertTriangle, IconChevronDown, IconChevronRight, IconMinus, IconPlus, IconRepeat } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import ms from "ms";

const empty: TrpcOut['meeting']['list'] = []

export function GroupHome(props: {
    group: {
        id: string,
        slug: string
    }
}) {

    const group = trpcReact.group.byId.useQuery({ id: props.group.id }).data;


    if (!group) return <Center>Chargement...</Center> //TODO handle loading
    const members = group.members.filter(x => x.roles.includes('MEMBER'))
    const captains = group.members.filter(x => x.roles.includes('CAPTAIN'))
    const membersChunks = chunkArray(members, 8)
    const captainsChunks = chunkArray(captains, 8)
    return <Group align="flex-start">
        <Stack>
            <Card shadow="md" padding="md" radius="md">
                <Stack>
                    <Box>
                        <Title order={6} mt={10}> {pad(captains.length)} Capitaines</Title>
                        {captainsChunks.map((chunk, index) => (
                            <Avatar.Group key={index}>
                                {chunk.map(m => <SloopAvatar key={m.userId} userId={m.userId} />)}
                            </Avatar.Group>
                        ))}
                    </Box>
                    <Box>
                        <Title order={6} mt={10}>{pad(members.length)} Membre</Title>
                        {membersChunks.map((chunk, index) => (
                            <Avatar.Group key={index}>
                                {chunk.map(m => <SloopAvatar key={m.userId} userId={m.userId} />)}
                            </Avatar.Group>
                        ))}
                    </Box>
                </Stack>
            </Card>
            <CopyvoteSection groupId={group.id} />
        </Stack>
        <GroupAgendaList group={props.group} />
    </Group>;
}

function pad(num: number, length: number = 3): string {
    const numStr = num.toString();
    if (numStr.length >= length) {
        return numStr;
    }
    const whitespaceCount = length - numStr.length;
    const whitespace = ' '.repeat(whitespaceCount);
    return whitespace + numStr;
}

const CopyvoteSection = (props: { groupId: string }) => {
    const { groupId } = props
    const { user: jwtUser } = useSloop()

    const [showWarning, setShowWarning] = useLocalStorage({
        key: 'copyvote-warning',
        defaultValue: true
    })
    return <Card shadow="md" padding="md" radius="md">
        <Stack>
            <Box>
                <Title order={6}>Mes pouvoir de votes (PV)</Title>
                {
                    showWarning && <Alert variant="light" color="yellow" withCloseButton icon={<IconAlertTriangle />} w={320} onClose={() => setShowWarning(false)}>
                        Attention les modifications faites ici n'impactes <Text fw={900} span>pas</Text> les votes déja en cours, allez directement sur le vote pour pouvoir modifier qui vous copiez
                    </Alert>
                }
                <Box>
                    {jwtUser ? <LoggedCopyvoteSection jwtUser={jwtUser} groupId={groupId} /> : <Text c='dimmed' size='xs'>Vous devez être connecté pour voir cette section</Text>}
                </Box>
            </Box>
        </Stack>
    </Card>
}

const LoggedCopyvoteSection = (props: { jwtUser: UserJwtPayload, groupId: string }) => {
    const { groupId } = props
    const user = trpcReact.user.byId.useQuery({ id: props.jwtUser.id }, { staleTime: ms('5m') }).data;
    const group = trpcReact.group.byId.useQuery({ id: groupId }).data;

    if (!user || !group) return <Center>Chargement...</Center> //TODO handle loading

    if (group.members.find(x => x.userId === user.id) === undefined) return <Text c="dimmed" size='xs'>Vous n'êtes pas membre de ce groupe</Text>
    const totalPowerGiven = group.copies.filter(x => x.copierId === user.id).reduce((acc, x) => acc + x.power, 0)

    const copied = (x: { copierId: string, copiedId: string, power: number }) => x.copierId === user.id
    const copier = (x: { copierId: string, copiedId: string, power: number }) => x.copiedId === user.id

    return <Stack mt={12}>
        <Stack align='flex-start'>
            <Stack>
                <Text>Il vous reste {VOTE_BASE_POWER - totalPowerGiven}% de pouvoir de vote non utilisé</Text>
                <Group justify="space-between">
                    <Text>Vous copiez:</Text>
                    <AddCopyAction
                        startingValues={{ groupId }}
                        button={props =>
                            <ActionIcon {...props}><IconPlus /></ActionIcon>
                        }
                    />
                </Group>
                <List icon={<></>}>
                    {
                        //TODO handle if group.votingGroups.length > 1
                        group.copies.filter(copied).map(
                            d => <Downfall key={`${d.copierId}-${d.copiedId}`} copy={d} groupId={groupId} idStack={[]} direction='copied' />
                        )
                    }
                </List>
            </Stack>
            <Stack>
                <Text>Vous êtes copié:</Text>
                <List icon={<></>}>
                    <Stack>
                        {
                            //TODO handle if group.votingGroups.length > 1
                            group.copies.filter(copier).map(
                                d => <Downfall key={`${d.copierId}-${d.copiedId}`} copy={d} groupId={groupId} idStack={[]} direction='copier' />
                            )
                        }
                    </Stack>
                </List>
            </Stack>
        </Stack>
    </Stack>
}

export const Downfall = (props: {
    copy: {
        copiedId: string;
        copierId: string;
        power: number;
    },
    groupId: string,
    idStack: string[],
    direction: 'copier' | 'copied'
}) => {
    const { groupId } = props
    const { power, copierId, copiedId } = props.copy
    const copied = trpcReact.user.byId.useQuery({ id: copiedId }).data;
    const copier = trpcReact.user.byId.useQuery({ id: copierId }).data;
    const [showNext, setShowNext] = useState(false)
    const { user } = useSloop()
    const downstreamUser = props.direction === 'copier' ? copier : copied
    const upstreamUser = props.direction === 'copier' ? copied : copier


    const downstreamUserCopier = useCallback((x: { copiedId: string }) => x.copiedId === downstreamUser?.id, [downstreamUser?.id])
    const downstreamUserCopied = useCallback((x: { copierId: string }) => x.copierId === downstreamUser?.id, [downstreamUser?.id])

    const group = trpcReact.group.byId.useQuery({ id: groupId }).data

    const next = useMemo(() => {
        if (!showNext) return null
        if (!downstreamUser) return <></>//TODO handle loading
        if (!group) return <></>//TODO handle loading
        const downstreamFilter = props.direction === 'copier' ? downstreamUserCopier : downstreamUserCopied
        const nextDeleg = group.copies.filter(downstreamFilter)
        if (!nextDeleg || nextDeleg.length < 1) return <>No more receiver</>
        return nextDeleg?.map(
            nextDeleg => <Downfall key={`${nextDeleg.copierId}-${nextDeleg.copiedId}`} copy={nextDeleg} groupId={groupId} idStack={[downstreamUser.id, ...props.idStack]} direction={props.direction} />
        )
    }, [showNext, downstreamUser, group, props.direction, props.idStack, downstreamUserCopier, downstreamUserCopied, groupId])

    if (!downstreamUser || !upstreamUser) return <></>//TODO handle loading

    return <List.Item>
        <Group justify="space-between">
            <ActionIcon size='compact-md' variant='subtle' onClick={() => setShowNext(!showNext)}>{showNext ? <IconChevronDown size={20} /> : <IconChevronRight size={20} />}</ActionIcon>
            a {power}%  {props.direction === 'copier' ? 'par' : null} <InlineUser userId={downstreamUser.id} />  {props.idStack.includes(downstreamUser.id) && <IconRepeat />}

            {showNext && <Text span c='dimmed' size='xs'>qui lui même {props.direction === 'copied' ? "copie" : "est copié"} ...</Text>}
            {user && copierId === user.id && <DelCopyAction
                params={{ groupId: groupId, receiverId: copiedId }}
                button={props => <ActionIcon {...props} variant="light"><IconMinus /></ActionIcon>}
            />}
        </Group>
        {showNext && next}
    </List.Item>
}

export function GroupAgendaList(props: {
    group: {
        id: string,
        slug: string
    }
}) {
    const group = trpcReact.group.byId.useQuery({ id: props.group.id }).data;

    const sloopMeetings = trpcReact.meeting.list.useQuery({ groupId: group?.id || "whatever-its-disabled" }, {
        enabled: !!group,
    }).data || empty

    const meetings = sloopMeetings.map(x => ({
        title: x.title,
        start: x.scheduledStartAt,
        end: x.scheduledEndAt,
        id: x.id,
        slug: x.slug,
    }))

    const navigate = useNavigate()

    return <FullCalendar
        locales={[frLocale]}
        locale="fr"
        plugins={[listPlugin]}
        initialView="listMonth"
        height={"calc(100vh - 200px)"}
        events={meetings}
        eventClick={(info) => {
            console.log(info.event.id)
            info.jsEvent.preventDefault(); // don't let the browser navigate
            const event = info.event as unknown as typeof meetings[number]
            navigate({
                to: '/meeting/$id/$slug',
                params: {
                    id: event.id,
                    slug: event.slug
                },
            })
            if (info.event.url) {
                window.open(info.event.url);
            }
        }}
        eventMouseEnter={(info) => {
            info.el.style.cursor = 'pointer';
        }}
        eventMouseLeave={(info) => {
            info.el.style.cursor = '';
            navigate
        }}
        headerToolbar={{}}
    />
}
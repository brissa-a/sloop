import { ActionIcon, Affix, AvatarGroup, Box, Button, Card, Center, Divider, Flex, Group, Modal, Stack, Table, Text, Title, Tooltip } from "@mantine/core";
import { useDebouncedValue, useDisclosure, useDocumentVisibility } from "@mantine/hooks";
import { MainLayout } from "@sloop-vite/MainLayout";
import { InlineGroup } from "@sloop-vite/component/group/InlineGroup";
import { Chat } from "@sloop-vite/component/meeting/Chat";
import { EditTitleForm } from "@sloop-vite/component/meeting/edition/EditTitleForm";
import { AddAgendaPointForm } from "@sloop-vite/component/meeting/edition/agenda/AddAgendaPointForm";
import { DeleteAgendaPointForm } from "@sloop-vite/component/meeting/edition/agenda/DeleteAgendaPointForm";
import { EditAgendaPointForm } from "@sloop-vite/component/meeting/edition/agenda/EditAgendaPointForm";
import { SmallCopyButton } from "@sloop-vite/component/misc/SmallCopy";
import { VotingConsole } from "@sloop-vite/component/voting/VotingConsole";
import { useMeetingSubscription } from "@sloop-vite/hooks/meeting";
import { useSloop } from "@sloop-vite/hooks/sloop";
import { TrpcOut, trpcReact } from "@sloop-vite/misc/trpc";
import { IconAppWindow, IconCalendarEvent, IconFilter, IconHandOff, IconHandStop, IconPlayerPlay } from "@tabler/icons-react";
import { createLazyFileRoute } from "@tanstack/react-router";
import ms from 'ms';
import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { SloopAvatar } from "../component/user/Avatar";
import { chunkArray } from "../misc/array";


export type MeetingByIdOutput = Exclude<TrpcOut['meeting']['byId'], null>
type AllAgendaPoint = MeetingByIdOutput['pointAgenda']


export const Route = createLazyFileRoute('/meeting/$id/$slug')({
    component: () => <MainLayout><Meeting /></MainLayout>
})

export function Meeting() {
    const { id, slug } = Route.useParams()
    const meetingFetcher = trpcReact.meeting.byId.useQuery({ id });
    const meeting = meetingFetcher.data;
    const refetchMeeting = meetingFetcher.refetch
    const raiseHand = trpcReact.meeting.raiseHand.useMutation().mutate
    const lowerHand = trpcReact.meeting.lowerHand.useMutation().mutate
    const navigate = Route.useNavigate()
    const [agendaPointFilter, setAgendaPointFilter] = useState<string | null>(null)
    const { user } = useSloop()
    const [voteConsoleOpened, { open: openVoteConsole, close: closeVoteConsole }] = useDisclosure()
    const [initialActiveVotingId, setInitialActiveVotingId] = useState<string>("")

    const refetchMeetingCallback = useCallback(() => {
        refetchMeeting()
    }, [refetchMeeting])

    //const debouncedRefetchMeetingCallback = useDebouncedCallback(refetchMeetingCallback, 500)

    const visible = useDocumentVisibility() === 'visible'
    const [visibleDebounced] = useDebouncedValue(visible, ms('1h'));
    //TODO are you still here? before 5min inactivity/invisible
    const activeSubscription = visible || visibleDebounced //Subscription inactive if not visible for 5min, active if visible and not idle
    const meetingSubscription = useMeetingSubscription(id, refetchMeetingCallback, activeSubscription)
    const userHandRaised = user && meeting?.raisedHands[user.id]
    //turn true if visible for 1s, turn false if not visible for 5s
    useEffect(() => {
        if (meeting) {
            document.title = meeting.title;
        }
        if (meeting && meeting.slug !== slug) {
            navigate({
                to: '/meeting/$id/$slug',
                params: { id: meeting.id, slug: meeting.slug }
            })
        }
    })


    if (!meetingSubscription.active) return <Center>Connecting to meeting... </Center>;
    if (!meeting) return null;
    //console.log('meeting', meeting)
    return <>
        <Stack>
            <Header meeting={meeting} />
            <Flex mt={15} >
                <Modal.Root opened={voteConsoleOpened} onClose={closeVoteConsole} size='80vw'>
                    <Modal.Overlay />
                    <Modal.Content h='80vh'>
                        <VotingConsole
                            title={
                                <Stack gap={0}>
                                    <Text c='dimmed' size='sm'>Console de vote de la réuion:</Text>
                                    <Group><IconAppWindow size={30} /><Title order={2}>{meeting.title}</Title></Group>
                                </Stack>
                            }
                            votingIds={meeting.voting.map(v => v.id)}
                            initialActiveVotingId={initialActiveVotingId}
                            onClose={closeVoteConsole}
                        />
                    </Modal.Content>
                </Modal.Root>
                {/* <Modal
                    styles={{
                        body: {
                            backgroundColor: bg,
                            padding: 0,
                            margin: 0,
                            height: "calc(100% - 500px)",
                        },
                    }}
                    scrollAreaComponent={Box}
                    opened={voteConsoleOpened} onClose={closeVoteConsole} size='80vw'>
                </Modal> */}
                <Stack w="450" m={10}>
                    <MeetingInfo meeting={meeting} />
                    <VoteInfo meeting={meeting} openVoteConsole={openVoteConsole} />
                    <Agenda meeting={meeting}>
                        <PointList meeting={meeting} nodes={meeting.pointAgenda} parentId={null} usedAgendaPointFilter={[agendaPointFilter, setAgendaPointFilter]} />
                    </Agenda>
                </Stack>
                <Box m={10}>
                    <Divider />
                    <Chat meeting={meeting} pointAgendaId={agendaPointFilter} openVoteConsole={(initialActiveVotingId) => {
                        setInitialActiveVotingId(initialActiveVotingId)
                        openVoteConsole()
                    }} />
                </Box>
            </Flex>
        </Stack>
        <Affix position={{ bottom: 40, right: 40 }}>
            {!userHandRaised
                ? <ActionIcon onClick={() => raiseHand({ id })} color="blue" radius="xl" size={60}>
                    <IconHandStop stroke={1.5} size={30} />
                </ActionIcon>
                : <ActionIcon onClick={() => lowerHand({ id })} color="blue" radius="xl" size={60}>
                    <IconHandOff size={30} />
                </ActionIcon>}
        </Affix>
    </>;
}

const VoteInfo = (props: { meeting: MeetingByIdOutput, openVoteConsole: (initialActiveVotingId: string) => void }) => {
    const activeVotingCount = props.meeting.voting.filter(v => v.actualStartAt != null && v.actualEndAt === null).length
    const passedVotingCount = props.meeting.voting.filter(v => v.actualEndAt != null).length
    const futureVotingCount = props.meeting.voting.filter(v => v.actualStartAt === null).length

    return <Card shadow="xs">
        <Stack>
            <Group justify="space-between">
                <Title order={3}>Votes</Title>
                <Button
                    size='sm' variant="outline"
                    onClick={() => props.openVoteConsole("")}
                    leftSection={<IconAppWindow />}>
                    Console de vote
                </Button>
            </Group>
            <Table>
                <Table.Tbody>
                    <Table.Tr>
                        <Table.Td>Éffectués</Table.Td>
                        <Table.Td fw={700}>{passedVotingCount}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td>En cours</Table.Td>
                        <Table.Td fw={700}>{activeVotingCount}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td>Encore prévu</Table.Td>
                        <Table.Td fw={700}>{futureVotingCount}</Table.Td>
                    </Table.Tr>
                </Table.Tbody>
            </Table>
        </Stack>
    </Card>
}

const fontSizeFactor = (length: number, base: number) => {
    if (length < 30) {
        return (5 * base) + 'rem';
    } else if (length < 40) {
        return (4 * base) + 'rem';
    } else if (length < 60) {
        return (3 * base) + 'rem';
    } else if (length < 80) {
        return (2 * base) + 'rem';
    } else /*length >= 80*/ {
        return (base) + 'rem';
    }
};

const Header = (props: { meeting: MeetingByIdOutput }) => {
    const start = trpcReact.meeting.start.useMutation().mutate
    const end = trpcReact.meeting.end.useMutation().mutate

    const { meeting } = props;
    return <Group wrap="nowrap" justify="space-between">
        <Stack gap={0}>
            <Group h={60} justify="center">
                <IconCalendarEvent size='2rem' />
                <Group gap={0} align="end">
                    <Title size={fontSizeFactor(meeting?.title.length || 10, 0.5)}>{meeting.title}</Title>
                    {meeting ? <EditTitleForm meeting={meeting} /> : null}
                </Group>
            </Group>
            <Group justify="space-between">
                <Group gap={0}>
                    <Text size="sm" c='dimmed'>id: {meeting.id}</Text>
                    <SmallCopyButton text={meeting.id} />
                </Group>
            </Group>
        </Stack>
        <Group>
            {
                meeting?.actualStartAt === null
                    ? <Button onClick={() => start({ id: meeting.id })}>Démarrer la réuion</Button>
                    : <Button onClick={() => end({ id: meeting.id })}>Terminer la réunion</Button>
            }
        </Group>
    </Group>
}

const Agenda: React.FC<PropsWithChildren & { meeting: MeetingByIdOutput }> = (props) => {
    return <Card shadow="xs">
        <Box w='100%'>
            <Group justify="space-between">
                <Title order={3}>Agenda</Title>
                <AddAgendaPointForm meeting={props.meeting} />
            </Group>
            <Box mt={15}>
                {props.meeting.pointAgenda.length === 0 && <Box>
                    <Text>Aucun point à l'ordre du jour</Text>
                    <Text>Cliquer sur <Text size="xl" fw={500} span>+</Text> pour en ajouter un premier</Text>
                </Box>}
                {props.children}
            </Box>
        </Box>
    </Card>;
}

const PointList = ({ meeting, nodes, parentId, usedAgendaPointFilter }: { meeting: MeetingByIdOutput, nodes: AllAgendaPoint, parentId: string | null, usedAgendaPointFilter: [string | null, (pointId: string | null) => void] }) => {
    const [agendaPointFilter, setAgendaPointFilter] = usedAgendaPointFilter
    const toDisplay = nodes.filter(n => n.parentId === parentId);
    const startPoint = trpcReact.meeting.agenda.startPoint.useMutation()
    return <Stack>
        {toDisplay.map((point, index) => (
            // icon={point.id === meeting.currentAgendaPointId ? <ThemeIcon color="blue" size={24} radius="xl"><IconPlayerPlay /></ThemeIcon> : <IconPoint />}
            <Box key={index} w='100%'>
                <Group justify="space-between">
                    <Text>{point.name}</Text>
                    <Group justify="space-around" gap={0}>
                        {/* //TODO remplacer par un "ajouter un point" dans la hierarchie */}
                        <AddAgendaPointForm meeting={meeting} parentAgendaPointId={point.id} />
                        {/* //TODO remplacer par un ... menu */}
                        <EditAgendaPointForm meeting={meeting} agendaPointId={point.id} />
                        <DeleteAgendaPointForm meeting={meeting} agendaPointId={point.id} />
                        <ActionIcon variant={agendaPointFilter === point.id ? "filled" : "subtle"} onClick={() => agendaPointFilter !== point.id ? setAgendaPointFilter(point.id) : setAgendaPointFilter(null)}><IconFilter /></ActionIcon>
                        {/* Sauf pour celui la */}
                        <ActionIcon variant={point.id === meeting.currentAgendaPointId ? 'filled' : 'subtle'} onClick={() => startPoint.mutate({ meetingId: meeting.id, pointId: point.id })}><IconPlayerPlay /></ActionIcon>
                    </Group>
                </Group>
                <Box ml={15}>
                    <PointList meeting={meeting} nodes={nodes} parentId={point.id} usedAgendaPointFilter={usedAgendaPointFilter} />
                </Box>
            </Box>
        ))}
    </Stack>
}


const MeetingInfo = (props: { meeting: Exclude<TrpcOut['meeting']['byId'], null> }) => {

    const subscribedChunks = chunkArray(props.meeting.subscriptions, 8);
    const convoqués = props.meeting.invitees
    const convoquésChunks = chunkArray(convoqués, 8);

    // console.log({ convoqués })
    // const visiteurs = shuffleArray(props.meeting.attendees).slice(0, 4);
    // const visiteursChunks = chunkArray(visiteurs, 8);

    return <Card shadow="xs">
        <Title order={3}>Information</Title>

        <Box mt={15}>
            <Text size="xs">Groupe convoqué</Text>
            <Text><InlineGroup groupId={props.meeting.groupId} /></Text>
        </Box>
        <Box mt={15}>
            <Box>
                <Tooltip label="Personne actuellement connecté a cette réunion">
                    <Text size="xs">Présents</Text>
                </Tooltip>
                {subscribedChunks.map((chunk, index) => (
                    <AvatarGroup key={index}>
                        {chunk.map(m => <>
                            <SloopAvatar key={m.id} userId={m.jwtPayload?.user.id || null} />
                        </>)}
                    </AvatarGroup>
                ))}
            </Box>
        </Box>
        <Box mt={15}>
            <Text size="xs">Convoqués</Text>
            {convoquésChunks.map((chunk, index) => (
                <AvatarGroup key={index}>
                    {chunk.map(m => <SloopAvatar key={m.user.id} userId={m.user.id} />)}
                </AvatarGroup>
            ))}
        </Box>
    </Card>;
};

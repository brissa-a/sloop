import { Box, Button, Card, Group, ScrollArea, Stack, Text, Textarea } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { UserJwtPayload } from "@sloop-common/jwt"
import { fromPrismaSuperjson } from "@sloop-common/misc/superjson"
import { PossibleActions } from "@sloop-common/sloop_zod/possibleActions"
import { useSloop } from "@sloop-vite/hooks/sloop"
import { humanFriendlyFromTo } from "@sloop-vite/misc/date"
import { trpcReact } from "@sloop-vite/misc/trpc"
import { MeetingByIdOutput } from "@sloop-vite/routes/meeting.$id.$slug.lazy"
import { IconHandOff, IconHandStop } from "@tabler/icons-react"
import React, { useEffect, useRef } from "react"
import { SloopAvatar } from "../user/Avatar"
import { CreateVotingModal } from "../voting/CreateVotingModal"
import { VotingCard } from "./renderers/VotingRenderer"
import { useDisclosure } from "@mantine/hooks"
import ms from "ms"

type ChatProps = {
    meeting: MeetingByIdOutput
    pointAgendaId: string | null
    openVoteConsole: (initialActiveVotingId: string) => void
}

export const Chat = ({ meeting, pointAgendaId, openVoteConsole }: ChatProps) => {
    const { user } = useSloop()
    const filteredLogEntries = meeting.logEntries//TODO .filter(entry => entry.entry.data)
    const filteredMessages = meeting.messages.filter(message => message.agendaPointId === pointAgendaId || !pointAgendaId)
    const filteredVoting = meeting.voting.filter(voting => voting.agendaPointId === pointAgendaId || !pointAgendaId)
    const aMix = mix(filteredLogEntries, filteredMessages, filteredVoting)
    const viewport = useRef<HTMLDivElement>(null);

    const chatEntriesComps = aMix.map((a, index) => renderChatEntries(meeting, a, index, openVoteConsole))

    useEffect(() => {
        viewport.current?.scrollTo({ top: viewport.current!.scrollHeight, behavior: 'instant' })
    }, [])

    useEffect(() => {
        viewport.current?.scrollTo({ top: viewport.current!.scrollHeight, behavior: 'smooth' })
    }, [chatEntriesComps.length])

    const disclosure = useDisclosure()
    const [, { open: openVotingModal }] = disclosure

    return < Box >
        <ScrollArea h="50vh" viewportRef={viewport} type='always' mt={15}>
            {chatEntriesComps}
        </ScrollArea>
        <Stack style={{ borderColor: "lightyellow" }}>
            {user ? <SendMessageSection meeting={meeting} user={user} /> : <Text>Please login to send messages</Text>}
            <Group>
                <CreateVotingModal startingValues={{ meetingId: meeting.id, agendaPointId: pointAgendaId || "", groupId: meeting.group.id }} usedDisclosure={disclosure} />
                <Button size='md' onClick={openVotingModal}>Faire un vote</Button>
            </Group>
        </Stack>
    </Box >
}

const SendMessageSection = ({ meeting, user }: { meeting: MeetingByIdOutput, user: UserJwtPayload }) => {
    const sendMessage = trpcReact.meeting.message.add.useMutation()

    return <Box>
        <Textarea placeholder={`Écrire un message concernant: ${meeting.currentAgendaPoint?.name || meeting.title}`} onKeyDown={(event) => {
            if (event.key === 'Enter' && event.ctrlKey) {
                sendMessage.mutate({
                    meetingId: meeting.id,
                    userId: user.id,
                    message: event.currentTarget.value,
                    agendaPointId: meeting.currentAgendaPoint?.id
                })
                event.currentTarget.value = ''
            }
        }
        } />
    </Box>
}

function mix(logEntries: MeetingByIdOutput['logEntries'], messages: MeetingByIdOutput['messages'], voting: MeetingByIdOutput['voting']) {
    const logWithSortDate = logEntries.map(entry => ({ type: 'log', ...entry, date: entry.entry.doneAt } as const))
    const messagesWithSortDate = messages.map(message => ({ type: 'msg', ...message, date: message.createdAt } as const))
    const votingWithSortDate = voting.flatMap(vote => {
        if (vote.actualStartAt) {
            return [{ type: 'vote', ...vote, date: vote.actualStartAt } as const]
        }
        return []
    })
    const aMix = [...logWithSortDate, ...messagesWithSortDate, ...votingWithSortDate]
    aMix.sort((a, b) => a.date.getTime() - b.date.getTime())
    return aMix
}

function isKeyOfPossibleActions(key: string): key is keyof typeof PossibleActions {
    return key in PossibleActions;
}

type LogEntryComponentProps = {
    meeting: MeetingByIdOutput,
    entry: MeetingByIdOutput['logEntries'][number]['entry'],
    index: number
}

export type LogEntryComp = React.FC<LogEntryComponentProps>

const renderers: Partial<Record<keyof typeof PossibleActions, LogEntryComp>> = {
    UserJoinMeetingSchema: () => <></>,
    UserLeftMeetingSchema: () => <></>,
    AddMessageSchema: () => <></>,
    AddAgendaPointSchema: ({ entry, index }) => {
        const data = PossibleActions.AddAgendaPointSchema.parse(fromPrismaSuperjson(entry.data))
        const doneByUser = trpcReact.user.byId.useQuery({ id: entry.doneBy.user.id }, { staleTime: ms('5m') }).data

        return <Card my={10} shadow="xs" key={index}>
            <Text size="sm">Point d'agenda ajouté par @{doneByUser?.username}</Text>
            <Text>{data.name}</Text>
        </Card>
    },
    StartPointAgendaSchema: ({ meeting, entry, index }) => {
        const data = PossibleActions.StartPointAgendaSchema.parse(fromPrismaSuperjson(entry.data))
        const doneByUser = trpcReact.user.byId.useQuery({ id: entry.doneBy.user.id }, { staleTime: ms('5m') }).data
        const pt = meeting.pointAgenda.find(p => p.id === data.pointId)
        return <Card my={10} shadow="xs" key={index}>
            <Text fs='italic' size="xs">Point d'agenda <Text size="md" span>{pt?.name}</Text> démarré par <Text size="md" span>{doneByUser?.username}</Text></Text>
        </Card >
    },
    CreateMeetingSchema: ({ entry, index }) => {
        const data = PossibleActions.CreateMeetingSchema.parse(fromPrismaSuperjson(entry.data))
        const doneByUser = trpcReact.user.byId.useQuery({ id: entry.doneBy.user.id }, { staleTime: ms('5m') }).data
        const group = trpcReact.group.byId.useQuery({ id: data.groupId }).data
        return <Card my={10} shadow="xs" key={index}>
            <Text fs='italic' size="xs">
                Réunion créé <Text size="md" span>@{doneByUser?.username}</Text>
                <Text>{data.title}</Text>
                <Group>
                    <Text fs='italic' size="xs">{humanFriendlyFromTo(data.scheduledStartAt, data.scheduledEndAt)}</Text>
                    #{group?.name}
                </Group>
            </Text>
        </Card >
    },
    UpdateMeetingSchema: ({ entry, index }) => {
        const data = PossibleActions.UpdateMeetingSchema.parse(fromPrismaSuperjson(entry.data))
        const doneByUser = trpcReact.user.byId.useQuery({ id: entry.doneBy.user.id }, { staleTime: ms('5m') }).data
        return <Card my={10} shadow="xs" key={index}>
            <Text fs='italic' size="xs">
                Réunion modifiée par <Text size="md" span>@{doneByUser?.username}</Text>
                {data.update.title && <Group><Text c='dimmed' size='xs'>Titre</Text><Text>{data.update.title}</Text></Group>}
                {data.update.slug && <Group><Text c='dimmed' size='xs'>Slug</Text><Text>{data.update.slug}</Text></Group>}
                {data.update.description && <Group><Text c='dimmed' size='xs'>Description</Text><Text>{data.update.description}</Text></Group>}
                {data.update.location && <Group><Text c='dimmed' size='xs'>Lieu</Text><Text>{data.update.location}</Text></Group>}
                {data.update.scheduledStartAt && <Group><Text c='dimmed' size='xs'>Début</Text><Text>{data.update.scheduledStartAt.toISOString()}</Text></Group>}
                {data.update.scheduledEndAt && <Group><Text c='dimmed' size='xs'>Fin</Text><Text>{data.update.scheduledEndAt.toISOString()}</Text></Group>}
            </Text>
        </Card>
    },
    StartMeetingSchema: ({ entry, index }) => {
        //const data = PossibleActions.StartMeetingSchema.parse(fromPrismaSuperjson(entry.data))
        const doneByUser = trpcReact.user.byId.useQuery({ id: entry.doneBy.user.id }, { staleTime: ms('5m') }).data
        return <Card my={10} shadow="xs" key={index}>
            <Text fs='italic' size="xs">
                Réunion <Text size="lg" span>🎬 démarrée</Text> par <Text size="md" span>@{doneByUser?.username}</Text>
            </Text>
        </Card>
    },
    EndMeetingSchema: ({ entry, index }) => {
        //const data = PossibleActions.EndMeetingSchema.parse(fromPrismaSuperjson(entry.data))
        const doneByUser = trpcReact.user.byId.useQuery({ id: entry.doneBy.user.id }, { staleTime: ms('5m') }).data
        return <Card my={10} shadow="xs" key={index}>
            <Text fs='italic' size="xs">
                Réunion <Text size="lg" span>🛑 terminée</Text> par <Text size="md" span>@{doneByUser?.username}</Text>
            </Text>
        </Card>
    },
    EditAgendaPointSchema: ({ entry, index }) => {
        const data = PossibleActions.EditAgendaPointSchema.parse(fromPrismaSuperjson(entry.data))
        const doneByUser = trpcReact.user.byId.useQuery({ id: entry.doneBy.user.id }, { staleTime: ms('5m') }).data
        return <Card my={10} shadow="xs" key={index}>
            <Text fs='italic' size="xs">
                Point d'agenda modifié par <Text size="md" span>@{doneByUser?.username}</Text>
                <Text>{data.name}</Text>
            </Text>
        </Card>
    },
    RaiseHandSchema: ({ meeting, entry, index }) => {
        const doneByUser = trpcReact.user.byId.useQuery({ id: entry.doneBy.user.id }, { staleTime: ms('5m') }).data
        return <Card my={10} shadow="xs" key={index}>
            <Group justify="space-between">
                <Group>
                    <Text fs='italic' size="xs">
                        <Text size="md" span>@{doneByUser?.username}</Text> demande la parole
                    </Text>
                    <IconHandStop size={20} />
                </Group>
                <Stack gap={0}>
                    <Button size="xs" variant="subtle" onClick={() => {
                        notifications.show({ title: 'Pas encore implémenté', message: 'Pas encore implémenté' })
                    }}>Donner la parole</Button>
                    {!meeting.raisedHands[entry.doneBy.user.id] ? <Text size="xs" c='dimmed'>ne demande plus la parole</Text> : <Text size="xs" c='dimmed'>demande toujours la parole</Text>}
                </Stack>
            </Group>
        </Card >
    },
    LowerHandSchema: ({ entry, index }) => {
        const doneByUser = trpcReact.user.byId.useQuery({ id: entry.doneBy.user.id }, { staleTime: ms('5m') }).data
        return <Card my={10} shadow="xs" key={index}>
            <Group>
                <Text fs='italic' size="xs">
                    <Text size="md" span>@{doneByUser?.username}</Text> a retiré sa demande de parole
                </Text>
                <IconHandOff size={20} />
            </Group>
        </Card>
    },
    CreateVotingSchema: () => <></>,
    DoVoteSchema: () => <></>,
}

function renderChatEntries(meeting: MeetingByIdOutput, chatEntry: ReturnType<typeof mix>[number], index: number, openVoteConsole: (initialActiveVotingId: string) => void) {
    if (chatEntry.type === 'log') {
        const { entry } = chatEntry
        const type = entry.type
        if (!isKeyOfPossibleActions(type)) {
            return <Box key={index}>
                <Text size="sm">{entry.type} {entry.doneAt.toDateString()} - {entry.doneBy.user.id} - {JSON.stringify(entry.data)}</Text>
            </Box>
        }
        const Renderer = renderers[type]
        if (!Renderer) {
            return <Box key={index}>
                <Text size="sm">{entry.type} {entry.doneAt.toDateString()} - {entry.doneBy.user.id} - {JSON.stringify(entry.data)}</Text>
            </Box>
        }
        return <Renderer meeting={meeting} index={index} entry={entry} />
    } if (chatEntry.type === 'vote') {
        const voting = chatEntry
        return <VotingCard key={index} voting={voting} openVoteConsole={openVoteConsole} />
    } else {
        const message = chatEntry
        return <Message key={index} message={message} />
    }
}

function Message({ message }: { message: MeetingByIdOutput['messages'][number] }) {
    const sender = trpcReact.user.byId.useQuery({ id: message.fromUserId }, { staleTime: ms('5m') }).data
    return <Card my={10} shadow="xs">
        <Group>
            <SloopAvatar userId={message.fromUserId} />
            <Stack gap={0}>
                <Text fs='italic' size="xs" mb={5}>
                    <Text size="md" span>@{sender?.username}</Text> dit:
                </Text>
                <Text size="sm">{message.content}</Text>
            </Stack>
        </Group>
    </Card>
}


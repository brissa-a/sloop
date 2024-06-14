import { ActionIcon, Alert, AvatarGroup, Badge, Box, Button, Card, Center, Divider, Group, Indicator, Loader, NumberInput, Paper, Popover, ScrollArea, Select, Space, Stack, Table, Tabs, Text, Title, Tooltip, useMantineColorScheme, useMantineTheme } from "@mantine/core"
import { useForm, zodResolver } from "@mantine/form"
import { useDebouncedValue, useDocumentVisibility, useHover, useLocalStorage } from "@mantine/hooks"
import { showNotification } from "@mantine/notifications"
import { VotingMethod } from "@sloop-common/prisma"
import { DoVoteSchema } from "@sloop-common/sloop_zod/meeting/voting"
import { VOTE_BASE_POWER } from "@sloop-express/misc/voting"
import { useSloop } from "@sloop-vite/hooks/sloop"
import { useVotingSubscription } from "@sloop-vite/hooks/voting"
import { IconVote } from "@sloop-vite/icon/IconVote"
import { TrpcOut, trpcReact } from "@sloop-vite/misc/trpc"
import { IconAlertCircle, IconCircleCheck, IconDownload, IconPlus, IconTrash } from "@tabler/icons-react"
import Big from "big.js"
import ms from "ms"
import { useCallback, useEffect, useState } from "react"
import { z } from "zod"
import { InlineMeeting } from "../meeting/InlineMeeting"
import { SmallCopyButton } from "../misc/SmallCopy"
import { Timeleft } from "../misc/Timeleft"
import { SloopAvatar } from "../user/Avatar"
import { InlineUser } from "../user/InlineUser"
import { UserInput } from "../user/UserInput"
import { APPROVAL_SCORE, ApprovalChoice } from "./choices/ApprovalChoice"
import { JUGEMENT_MAJORITAIRE_SCORES, JugementMajoritaireChoice } from "./choices/JugementMajoritaireChoice"
import { SINGLE_NAME_SCORE, SingleNameChoice } from "./choices/SingleNameChoice"

const VOTING_ITEM_BASE_HEIGHT = 100
const VOTING_ITEM_SCALE = 0.1
const VOTING_ITEM_BASE_WIDTH = 310 * (1 / (1 + VOTING_ITEM_SCALE))
const VOTING_ITEM_PADDING = 10
const VOTING_LIST_WIDTH = VOTING_ITEM_BASE_WIDTH * (1 + VOTING_ITEM_SCALE) + VOTING_ITEM_PADDING

const UserVotesSchema = z.object({
    voted: z.array(DoVoteSchema.shape.votes.element),
    copied: z.array(DoVoteSchema.shape.votes.element)
})

type UserVotes = z.infer<typeof UserVotesSchema>

export const VotingConsole = (props: { votingIds: string[], initialActiveVotingId?: string, title: JSX.Element, onClose?: () => void }) => {
    const { colorScheme } = useMantineColorScheme();
    const bg = colorScheme === 'light' ? '#FCFAFD' : '#1E1F21';
    const { votingIds, initialActiveVotingId } = props
    const [activeVotingId, setActiveVotingId] = useState(initialActiveVotingId || votingIds[0] || null)
    const unseen = trpcReact.unseen.get.useQuery().data || empty;
    const unseenVotingIds = unseen.unseenVoting.map(x => x.votingId)
    // const [iWantToSeeTheResultLive, setIWantToSeeTheResultLive] = useLocalStorage({
    //     key: 'iWantToSeeTheResults',
    //     defaultValue: true,
    // })

    return <Group bg={bg} gap={0} h="calc(100% - 120px)">
        <ScrollArea w={VOTING_LIST_WIDTH} h="100%">
            <VotingList
                ids={votingIds}
                activeId={activeVotingId}
                onSelect={activeVotingId => setActiveVotingId(activeVotingId)}
                unseenVotingIds={unseenVotingIds}
            />
        </ScrollArea>
        <Divider orientation="vertical" />
        <ScrollArea
            w={`calc(100% - ${VOTING_LIST_WIDTH + 5}px)`} h="100%">
            <Center>
                {activeVotingId && <VotingDetails key={activeVotingId} votingId={activeVotingId} />}
            </Center>
        </ScrollArea>
    </Group>
}


const empty: TrpcOut['unseen']['get'] = {
    unseenMeeting: [],
    unseenVoting: [],
    unseenProposal: [],
}


type VotingListProps = {
    ids: string[];
    activeId: string | null;
    onSelect: (votingID: string) => void;
    unseenVotingIds: string[];
};

const VotingList = (props: VotingListProps) => {

    return <Stack gap={0}>
        {props.ids.map(votingId => <VotingItem votingId={votingId} unseen={props.unseenVotingIds.includes(votingId)} active={props.activeId === votingId} onClick={() => props.onSelect(votingId)} />)}
    </Stack>
}

const VotingItem = (props: { votingId: string, active: boolean, onClick: () => void, unseen: boolean }) => {
    const voting = trpcReact.meeting.voting.byId.useQuery({ id: props.votingId }).data
    const { hovered, ref } = useHover();
    if (!voting) return <></> //TODO loading
    return <Paper ref={ref} shadow="md" onClick={props.onClick}
        mx={VOTING_ITEM_BASE_WIDTH * VOTING_ITEM_SCALE / 2 + 10}
        my={VOTING_ITEM_BASE_HEIGHT * VOTING_ITEM_SCALE}
        p={VOTING_ITEM_PADDING}
        style={{
            transform: props.active ? `scale(${1 + VOTING_ITEM_SCALE})` : hovered ? "scale(1.02)" : "scale(1)", cursor: "pointer"
        }} role="button" >
        <Stack>
            <Group gap={5} justify="center" h={60}>
                <IconVote width={25} height={25} />
                <Indicator disabled={!props.unseen}>
                    <Text w={VOTING_ITEM_BASE_WIDTH - 60} size={fontSizeFactor(voting?.name.length || 10, 0.2)}>{voting.name}</Text>
                </Indicator>
            </Group>
            {<Timeleft until={voting.scheduledEndAt} renderer={(d) => {
                const displaySeconds = d.d === 0 && d.h === 0 && d.m === 0
                const seconds = displaySeconds ? ` ${d.s}s` : null
                return <Stack gap={'xs'}>
                    <Center> <Text size="xs" span>{d.affixe === "in" ? "Termine dans " : "Terminé il y a "} {d.d}j {d.h}h {d.m}m {seconds}</Text></Center>
                </Stack>
            }} />}
            {voting.meetingId ? <Box><Text size="xs" c="dimmed">Vote débuté lors de la réunion:</Text> <InlineMeeting meetingId={voting.meetingId} /></Box> : null}
        </Stack>
    </Paper>
}


const VotingDetails = (props: { votingId: string }) => {
    //worker.postMessage('Hello, worker');
    const votingFetcher = trpcReact.meeting.voting.byId.useQuery({ id: props.votingId })
    const voting = votingFetcher.data
    const refetchVoting = votingFetcher.refetch
    const refetchVotingCallback = useCallback(() => {
        console.log('Refetching voting')
        refetchVoting()
    }, [refetchVoting])
    const unseen = trpcReact.unseen.get.useQuery().data || empty;
    const utils = trpcReact.useUtils()
    const markAsSeen = trpcReact.unseen.markVotingAsSeen.useMutation({
        onSuccess: () => {
            utils.unseen.get.invalidate()
        }
    }).mutate

    useEffect(() => {
        if (voting && unseen.unseenVoting.some(x => x.votingId === voting.id)) {
            markAsSeen({ votingId: voting.id })
        }
    }, [voting, markAsSeen, unseen.unseenVoting])

    const [stats, setStats] = useState<Awaited<ReturnType<typeof computeStats>> | null>(null)
    useEffect(() => {
        const params = {
            voting,
            canceled: false
        }
        const handle = setTimeout(() => {
            computeStats(params).then(setStats)
        }, 300)//delay to avoid flickering
        return () => {
            clearTimeout(handle)
            params.canceled = true
        }
    }, [voting])
    const visible = useDocumentVisibility() === 'visible'
    const [visibleDebounced] = useDebouncedValue(visible, ms('1h'));
    const activeSubscription = visible || visibleDebounced


    useVotingSubscription(props.votingId, refetchVotingCallback, activeSubscription)
    //TODO Subscribe to voting
    const doVote = trpcReact.meeting.voting.vote.useMutation({
        onSuccess: () => {
            showNotification({ title: 'Vote enregistré', message: 'Votre vote a bien été enregistré', autoClose: 3000 })
            setDirty(false)
        }
    })
    const { user: currentUser } = useSloop()

    const [userVotes, setUserVotes] = useState<UserVotes>({ voted: [], copied: [] })//Empty untill the voting is loaded
    const [dirty, setDirty] = useState(false)

    useEffect(() => {
        if (dirty) return;
        const currentUserVotes = currentUser && voting ? voting.votes.filter(x => x.voterId === currentUser.id) : []
        const userVotedVote = currentUserVotes.filter(vote => vote.scores.length > 0)
        const userCopiedVote = currentUserVotes.filter(vote => vote.copied != null)
        setUserVotes({
            voted: userVotedVote,
            copied: userCopiedVote
        })
    }, [currentUser, dirty, voting])

    const theme = useMantineTheme()
    const [copyvoteAlertOptions, setCopyvoteAlertOptions] = useLocalStorage({
        key: 'copyvoteAlertOptions',
        defaultValue: { show: true }
    })
    const [copivoteAlert, setCopivoteAlert] = useState(false)
    if (!voting) return <></> //TODO loading
    //TODO handle vote.copies
    const ChoiceComponent = votingMethodToChoiceComponent[voting.votingMethod]

    //const remainingPower = VOTE_BASE_POWER - [...userVotes.voted, ...userVotes.copied].reduce((acc, vote) => acc + vote.power, 0)
    return <Card shadow="md" m={30} pos='relative'>
        <Box top={10} right={10} pos='absolute'>
            {stats ? <></> : <Group><Text size='xs'>Calcule des résultats en cours</Text><Loader size={12} /></Group>}
        </Box>
        <Stack gap="xs">
            <Group justify="center" h={90}>
                <Center>
                    <Stack gap={0}>
                        <Group justify="center" gap={5} h={60}>
                            <IconVote width={30} height={30} />
                            <Title size={fontSizeFactor(voting?.name.length || 10, 0.3)} maw={"80%"}>{voting.name}</Title>
                        </Group>
                        <Group justify="space-between">
                            <Group gap={0}>
                                <Text size="sm" c='dimmed'>id: {voting.id}</Text>
                                <SmallCopyButton text={voting.id} />
                            </Group>
                            {<Timeleft until={voting.scheduledEndAt} renderer={(d) => {
                                const displaySeconds = d.d === 0 && d.h === 0 && d.m === 0
                                const seconds = displaySeconds ? ` ${d.s}s` : null
                                return <Stack gap={'xs'}>
                                    <Center> <Text size="xs" span>{d.affixe === "in" ? "Termine dans " : "Terminé il y a "} {d.d}j {d.h}h {d.m}m {seconds}</Text></Center>
                                </Stack>
                            }} />}
                        </Group>
                    </Stack>
                </Center>
            </Group>

            {<Group justify="space-evenly">
                <Group align="end">
                    <Text size="xs" c="dimmed">Ont voté:</Text>
                    <AvatarGroup>
                        {(stats || { uniqueVoters: [null, null, null] }).uniqueVoters.map((voterId, index) => <SloopAvatar size={"sm"} key={index} userId={voterId} />)}
                    </AvatarGroup>
                </Group>
                <Group gap="xs">
                    <Tooltip label={stats ? stats.anyTotal.res.toString() + "\n" + stats.anyTotal.lost.toString() : <Text c="dimmed" size='xs'>En cours de calcule...</Text>}>
                        <Badge variant="outline">{stats ? stats.anyTotal.res.mul(100).round(2).toString() : "..."}</Badge>
                    </Tooltip>
                    <Text>% de pouvoir engagés</Text>
                </Group>
                <Tooltip label="Télécharger TOUS les votes et copivotes en CSV" position="right" withArrow>
                    <ActionIcon><IconDownload /></ActionIcon>
                </Tooltip>
            </Group>}
            {/* {
                isCopivote && <Stack align="center" gap={0}>
                    <Text>Vous êtes en train de copier le vote de quelqu'un d'autre</Text>
                    <Button size="compact-xs" variant="transparent" onClick={() => setIsCopivote(false)}>Ne plus copier, voter moi même</Button>
                </Stack>
            } */}
        </Stack>
        <Space h={25} />
        <Tabs defaultValue="vote">
            <Group justify="space-between">
                <Tabs.List justify="flex-end">
                    <Tabs.Tab value="vote">
                        Votes {userVotes.voted.length > 0 ? <IconCircleCheck color={theme.colors['pirate']?.[5]} size={14} /> : null}
                    </Tabs.Tab>
                    <Popover opened={copivoteAlert} withArrow position="top" closeOnClickOutside={true} arrowSize={20}>
                        <Popover.Target>
                            <Tabs.Tab value="copivote">
                                Copies ({userVotes.copied.length})
                            </Tabs.Tab>
                        </Popover.Target>
                        <Popover.Dropdown maw={600}>
                            Nous avons supprimé vos copivotes pour vous redonner 100% de votre pouvoir de vote
                            <Group justify="right">
                                <Button size="compact-xs" variant="transparent" onClick={() => {
                                    setCopivoteAlert(false)
                                    setCopyvoteAlertOptions({ show: false })
                                }}>Compris, ne plus afficher ce message</Button>
                            </Group>
                        </Popover.Dropdown>
                    </Popover>
                    <Tabs.Tab value="advanced-vote">
                        Votes détaillés ({userVotes.voted.length})
                    </Tabs.Tab>
                    <Tabs.Tab value="flamegraph">
                        Where is my vote power gone ?
                    </Tabs.Tab>
                </Tabs.List>
                <Group gap={2}>
                    <Button
                        size="compact-md"
                        disabled={!dirty}
                        onClick={() => {
                            doVote.mutate({
                                votingId: voting.id,
                                votes: [...userVotes.voted, ...userVotes.copied]
                            })
                        }}
                        loading={doVote.isPending}
                    >
                        Enregistrer
                    </Button>
                    <Button disabled={!dirty}
                        size="compact-md"
                        variant="transparent"
                        onClick={() => {
                            setDirty(false)
                            refetchVoting()
                        }}>
                        Annuler
                    </Button>
                </Group>
            </Group>
            <Space h={25} />
            <Tabs.Panel value="vote" w={320 * 2}>
                <Stack gap="xs">
                    <Stack gap='xl'>
                        {
                            voting.choices.map((choice, index) =>
                                <ChoiceComponent
                                    key={index}
                                    voting={voting}
                                    choice={choice}
                                    stats={stats}
                                    usedUserVotes={[userVotes, (newUserVotes) => {
                                        setDirty(true)
                                        if (copyvoteAlertOptions.show && userVotes.copied.length > 0) {
                                            setCopivoteAlert(true)
                                        }
                                        setUserVotes(newUserVotes)
                                    }]}
                                />
                            )
                        }
                    </Stack>
                </Stack>
            </Tabs.Panel>
            <Tabs.Panel value="copivote" w={320 * 2}>
                <CopyvoteTab usedUserVotes={[userVotes, (userVotes) => {
                    setDirty(true)
                    setUserVotes(userVotes)
                }]} groupId={voting.groupId} />
            </Tabs.Panel>
            <Tabs.Panel value="advanced-vote" w={320 * 2}>
                <AdvancedVoteTab usedUserVotes={[userVotes, (userVotes) => {
                    setDirty(true)
                    setUserVotes(userVotes)
                }]} voting={voting} />
            </Tabs.Panel>
            {/* <Tabs.Panel value="flamegraph" w={320 * 2}>
                <Flamegraph voting={voting} />
            </Tabs.Panel> */}
        </Tabs>
    </Card >
}

// const Flamegraph = (props: { voting: Exclude<TrpcOut['meeting']['voting']['byId'], null> }) => {
//     const falemgraphData = computeStats(props.voting)
//     return <>
//         <Text>TODO</Text>
//     </>
// }

export type ChoiceComponent = (props: {
    voting: Exclude<TrpcOut['meeting']['voting']['byId'], null>,
    choice: Exclude<TrpcOut['meeting']['voting']['byId'], null>['choices'][number],
    stats: Awaited<ReturnType<typeof computeStats>>,
    error?: string,
    usedUserVotes: [
        userVotes: UserVotes,
        setUserVotes: React.Dispatch<React.SetStateAction<UserVotes>>
    ],
}) => JSX.Element

const votingMethodToChoiceComponent: Record<VotingMethod, ChoiceComponent> = {
    SINGLE_NAME: SingleNameChoice,
    APPROVAL: ApprovalChoice,
    JUGEMENT_MAJORITAIRE: JugementMajoritaireChoice,
}

const votingMethodToScore: Record<VotingMethod, readonly string[]> = {
    SINGLE_NAME: SINGLE_NAME_SCORE,
    APPROVAL: APPROVAL_SCORE,
    JUGEMENT_MAJORITAIRE: JUGEMENT_MAJORITAIRE_SCORES,
}

function CopyvoteTab(props: {
    usedUserVotes: [
        userVotes: UserVotes,
        setUserVotes: React.Dispatch<React.SetStateAction<UserVotes>>
    ],
    groupId: string
}) {
    const [userVotes, setUserVotes] = props.usedUserVotes

    const group = trpcReact.group.byId.useQuery({ id: props.groupId }).data;
    const [showWarning, setShowWarning] = useLocalStorage({
        key: 'copivotetab-showWarning',
        defaultValue: true,
    })
    const remainingPower = VOTE_BASE_POWER - userVotes.copied.reduce((acc, vote) => acc + vote.power, 0)
    const CopyvoteTabFormSchema = z.object({
        copiedId: z.string(),
        power: z.number().min(1).max(remainingPower),
    })
    const form = useForm({
        initialValues: { copiedId: '', power: 0 },
        validate: zodResolver(CopyvoteTabFormSchema),
    });

    if (!group) return <></> //TODO loading
    return <>
        {showWarning && <Alert variant="light" color="blue" withCloseButton icon={<IconAlertCircle />} onClose={() => setShowWarning(false)}>
            Les modifications faites ici impactent <Text fw={900} span>uniquement</Text> ce vote
        </Alert>}
        <form onSubmit={e => {
            form.onSubmit((values) => {
                const validated = CopyvoteTabFormSchema.parse(values);
                if (validated.power > remainingPower) {
                    form.setFieldError('power', 'Vous ne pouvez pas copier pour plus 100% de votre pouvoir de vote');
                    return;
                }
                setUserVotes({
                    voted: userVotes.voted,
                    copied: [...userVotes.copied, { copiedId: validated.copiedId, power: validated.power, scores: [] }]
                })
            })(e)
        }}>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th></Table.Th>
                        <Table.Th>Qui</Table.Th>
                        <Table.Th>%age pouvoir</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {userVotes.copied.map((vote, index) => {
                        return <Table.Tr key={index}>
                            <Table.Td>
                                <ActionIcon onClick={() => {
                                    setUserVotes({
                                        voted: userVotes.voted,
                                        copied: userVotes.copied.filter((_, i) => i !== index)
                                    })
                                }}><IconTrash size={18} /></ActionIcon>
                            </Table.Td>
                            <Table.Td>{vote.copiedId ? <InlineUser userId={vote.copiedId} /> : "C'est pas normal"}</Table.Td>
                            <Table.Td>{vote.power}</Table.Td>
                        </Table.Tr>
                    })}
                    <Table.Tr>
                        <Table.Td>
                            <ActionIcon type="submit"><IconPlus size={18} /></ActionIcon>
                        </Table.Td>
                        <Table.Td>
                            <UserInput {...form.getInputProps("copiedId")} data={group.members} />
                        </Table.Td>
                        <Table.Td>
                            <NumberInput {...form.getInputProps("power")} />
                        </Table.Td>
                    </Table.Tr>
                </Table.Tbody>
            </Table>
        </form>
    </>
}

function AdvancedVoteTab(props: {
    usedUserVotes: [
        userVotes: UserVotes,
        setUserVotes: React.Dispatch<React.SetStateAction<UserVotes>>
    ],
    voting: Exclude<TrpcOut['meeting']['voting']['byId'], null>
}) {
    const { voting } = props
    const [userVotes, setUserVotes] = props.usedUserVotes

    const remainingPower = VOTE_BASE_POWER - userVotes.voted.reduce((acc, vote) => acc + vote.power, 0)
    const possibleScore = votingMethodToScore[voting.votingMethod]
    const AdvancedVoteTabFormSchema = z.object({
        power: z.number().min(1).max(remainingPower),
        scores: z.array(z.object({
            forChoiceId: z.string(),
            score: z.string().refine(value => possibleScore.includes(value))
        }))
    })
    const form = useForm({
        initialValues: { scores: voting.choices.map(choice => ({ forChoiceId: choice.id, score: null as null | string })), power: 0 },
        validate: zodResolver(AdvancedVoteTabFormSchema),
    });


    return <>
        <form onSubmit={e => {
            form.onSubmit((values) => {
                const validated = AdvancedVoteTabFormSchema.parse(values);
                if (validated.power > remainingPower) {
                    form.setFieldError('power', 'Vous ne pouvez pas copier pour plus 100% de votre pouvoir de vote');
                    return;
                }
                setUserVotes({
                    voted: [...userVotes.voted, { copiedId: null, power: validated.power, scores: validated.scores }],
                    copied: [...userVotes.copied]
                })
                form.reset()
            })(e)
        }}>
            {Object.keys(form.errors).length ? <Alert variant="light" color="red">
                <pre>
                    {JSON.stringify(form.errors, null, 2)}
                </pre>
            </Alert> : null
            }
            <ScrollArea w="100%" type="auto" offsetScrollbars>
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th></Table.Th>
                            <Table.Th>Power</Table.Th>
                            {voting.choices.map(choice => <Table.Th key={choice.id} w={choice.name.length + "ch"}>{choice.name.replace(/ /g, '\u00A0')}</Table.Th>)}
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {userVotes.voted.map((vote, index) => {
                            return <Table.Tr key={index}>
                                <Table.Td>
                                    <ActionIcon onClick={() => {
                                        setUserVotes({
                                            voted: userVotes.voted.filter((_, i) => i !== index),
                                            copied: userVotes.copied
                                        })
                                    }}><IconTrash size={18} /></ActionIcon>
                                </Table.Td>
                                <Table.Td>{vote.power}</Table.Td>
                                {voting.choices.map(choice => {
                                    const score = vote.scores.find(score => score.forChoiceId === choice.id)
                                    return <Table.Td key={choice.id}>{score ? score.score : "N/A"}</Table.Td>
                                })}
                            </Table.Tr>
                        })}
                        <Table.Tr>
                            <Table.Td>
                                <ActionIcon type="submit"><IconPlus size={18} /></ActionIcon>
                            </Table.Td>
                            <Table.Td>
                                <NumberInput {...form.getInputProps("power")} w={75} />
                            </Table.Td>
                            {voting.choices.map(choice => {
                                const scores = form.getInputProps('scores').value as { forChoiceId: string, score: string }[]
                                const value = scores.find(x => x.forChoiceId === choice.id)!.score
                                return <Table.Td key={choice.id}>
                                    <Select value={value} data={possibleScore} w={100} onChange={(value) => {
                                        form.setFieldValue("scores", form.values.scores.map(score => {
                                            if (score.forChoiceId === choice.id) {
                                                return { ...score, score: value || "" }
                                            }
                                            return score
                                        }))
                                    }} />
                                </Table.Td>
                            })}
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </ScrollArea >
        </form>
    </>
}

type ChoiceStats = {
    [k: string]: {
        byScore: ScoreStat;
        total: ResNLoss;
    };
}

type ScoreStat = Record<string, ResNLoss>

type ResNLoss = {
    res: Big.Big;
    lost: Big.Big;
}

async function computeStats(params: {
    voting: TrpcOut['meeting']['voting']['byId'] | undefined,
    canceled: boolean,
}) {
    const { voting } = params
    //TODO user worker to offload this computation. getCopiersPower can be expensive
    if (!voting) return null
    const allScores = voting.choices.flatMap(choice => choice.scores)
    const powerByChoiceId: ChoiceStats = {}
    for (const choice of voting.choices) {
        const byScore: ScoreStat = {}
        for (const score of choice.scores) {
            const scoreAcc = byScore[score.score]
            if (!scoreAcc) {
                byScore[score.score] = {
                    res: new Big(0),
                    lost: new Big(0)
                }
            }
            const copiedScore = new Big(score.ofVote.power).div(VOTE_BASE_POWER)
            const copierPower = await getCopiersPower({ originalParams: params, voting, copiedId: score.ofVote.voterId, weight: copiedScore, copiedStack: [score.ofVote.voterId] })
            byScore[score.score] = {
                res: byScore[score.score]!.res.add(copiedScore).add(copierPower.res),
                lost: byScore[score.score]!.lost.add(copierPower.lost)
            }
        }
        const total = Object.values(byScore).reduce((acc, score) => ({
            res: acc.res.add(score.res),
            lost: acc.lost.add(score.lost)
        }), {
            res: new Big(0),
            lost: new Big(0)
        })
        powerByChoiceId[choice.id] = { byScore, total };
    }
    const anyTotal = powerByChoiceId[voting.choices[0]!.id]!.total
    if (Object.entries(powerByChoiceId).some(([, { total }]) => total.res.cmp(anyTotal.res) !== 0)) {
        throw new Error("Total power for each choice is not equal")
    }
    const uniqueVoters = [...new Set(allScores.map(score => score.ofVote.voter.id))]
    // const best = voting.choices.reduce<{ choice: typeof voting.choices[number], total: Big.Big }>((acc, choice) => {
    //     const total = powerByChoiceId[choice.id]!.total
    //     return total.cmp(acc.total) > 0 ? { choice, total } : acc
    // }, { choice: voting.choices[0]!, total: new Big(0) })
    return { anyTotal, uniqueVoters, powerByChoiceId }
}

//C'EST LE COEUR DU SYSTEM DE VOTE LIQUID
async function getCopiersPower(params: {
    originalParams: Parameters<typeof computeStats>[0],
    voting: Parameters<ChoiceComponent>[0]['voting'],
    copiedId: string,
    weight: Big.Big,
    copiedStack: string[]
}): Promise<{ res: Big.Big, lost: Big.Big }> {
    const { voting, copiedId, weight, copiedStack } = params
    if (weight.lt("1e-3")) {
        // console.log("maximum precision reached", weight.toFixed())
        return {
            res: new Big(0),
            lost: weight
        }
    }
    const copiersVote = voting.votes.filter(vote => vote.copiedId === copiedId)
    const acc = { res: new Big(0), lost: new Big(0) }
    for (const vote of copiersVote) {
        if (params.originalParams.canceled) {
            console.log("canceled")
            return acc
        }
        const copiedPower = new Big(vote.power).div(VOTE_BASE_POWER).mul(weight)
        // if (copiedStack.includes(vote.voterId)) {
        //     //console.log("cycle detected", copiedStack, vote.voterId)
        //     acc.lost = acc.lost.add(copiedPower)
        //     continue
        // }
        const copiersPower = await getCopiersPower({ originalParams: params.originalParams, voting, copiedId: vote.voterId, weight: copiedPower, copiedStack: [...copiedStack, vote.voterId] })
        acc.res = acc.res.add(copiedPower).add(copiersPower.res)
        acc.lost = acc.lost.add(copiersPower.lost)
    }
    return acc
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
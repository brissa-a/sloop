import { AvatarGroup, Button, Card, Center, Group, Stack, Text } from "@mantine/core";
import { Timeleft } from "@sloop-vite/component/misc/Timeleft";
import { SloopAvatar } from "@sloop-vite/component/user/Avatar";
import { trpcReact } from "@sloop-vite/misc/trpc";
import { MeetingByIdOutput } from "@sloop-vite/routes/meeting.$id.$slug.lazy";
import { IconAppWindow } from "@tabler/icons-react";
import ms from "ms";


export const VotingCard = (props: { voting: MeetingByIdOutput['voting'][number], openVoteConsole: (initialActiveVotingId: string) => void }) => {
    const { voting } = props
    const doneByUser = trpcReact.user.byId.useQuery({ id: voting.createdBy.user.id }, {
        staleTime: ms('5m')
    }).data

    // const computedUserVote = useMemo(() => computeVote(voting, user?.id ?? null), [voting, user])

    const voters = voting.choices.flatMap(choice => choice.scores.map(score => score.ofVote.voterId))
    const uniqueVoters = Array.from(new Set(voters))

    if (!doneByUser) return <></>
    return <Card my={10} shadow="xs">
        <Group justify="space-between">
            <Group>
                <SloopAvatar userId={doneByUser.id} />
                <Stack gap={0}>
                    <Text mb={5}>
                        <Text size="md" span>@{doneByUser.username}</Text>
                        <Text fw={600}>A créé un vote rapide: {voting.name}</Text>
                    </Text>
                    <Group align="end">
                        <Text size="xs" c="dimmed">Ont voté:</Text>
                        <AvatarGroup>
                            {uniqueVoters.map(voterId => <SloopAvatar size={"sm"} key={voterId} userId={voterId} />)}
                        </AvatarGroup>
                    </Group>
                </Stack>
            </Group>

            {<Timeleft until={voting.scheduledEndAt} renderer={(d) => {
                const displaySeconds = d.d === 0 && d.h === 0 && d.m === 0
                const seconds = displaySeconds ? ` ${d.s}s` : null
                const isOver = d.affixe === "ago"
                return <Stack gap={'xs'}>
                    <Button onClick={() => props.openVoteConsole(voting.id)} variant={isOver ? "subtle" : "filled"} leftSection={<IconAppWindow />}>{!isOver ? "Voter" : "Voir les résultats"}</Button>
                    <Center> <Text size="xs" span>{d.affixe === "in" ? "Termine dans " : "Terminé il y a "} {d.d}j {d.h}h {d.m}m {seconds}</Text></Center>
                </Stack>
            }} />}
        </Group>
        {/* <Group justify="space-evenly" ><Text>0% voté</Text> <Text>0% copyvoté</Text> <Button>Voir la distribution de mes pouvoirs de vote</Button></Group> */}
    </Card >
}

// function computeVote(voting: MeetingByIdOutput['voting'][number], userId: string | null) {
//     if (!userId) return null
//     const currentUserVotes = voting.choices.flatMap(x => x.votes.filter(vote => vote.voter.userId === userId))
//     const currentUserVotePowerUsed = currentUserVotes.reduce((acc, vote) => acc + vote.power, 0)
//     const remaingVotePower = VOTE_BASE_POWER - currentUserVotePowerUsed
//     return { currentUserVotes, currentUserVotePowerUsed, remaingVotePower }
// }




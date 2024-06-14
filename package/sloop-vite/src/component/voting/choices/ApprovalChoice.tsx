import { Box, Group, Select, Stack, Text, Tooltip } from "@mantine/core";
// import { VOTE_BASE_POWER } from "@sloop-express/misc/voting";
import { VOTE_BASE_POWER } from "@sloop-express/misc/voting";
import { IconMedal2 } from "@tabler/icons-react";
import Big from "big.js";
import { useMemo } from "react";
import { z } from "zod";
import { ChoiceComponent } from "../VotingConsole";

export const APPROVAL_SCORE = ["Pour", "Contre"] as const

const ApprovalVoteSchema = z.array(z.object({
    scores: z.array(z.object({
        forChoiceId: z.string(),
        score: z.enum(APPROVAL_SCORE)
    })),
    copiedId: z.string().nullable(),
    power: z.number(),
}))




export const ApprovalChoice: ChoiceComponent = (props) => {
    const { stats, error } = props
    const [userVotes, setUserVotes] = props.usedUserVotes

    const voted = ApprovalVoteSchema.parse(userVotes.voted)

    //TODO handle if voted.lenght > 1
    const scores = voted[0]?.scores || []
    const score = scores.find(x => x.forChoiceId === props.choice.id)?.score ?? null


    //console.log({ percent, totalVp: props.totalVpInvolved })

    const {
        pourStats,
        percentPrecise,
        percentRounded,
        totalScoreRouned,
        place,
    } = useMemo(() => {
        if (!stats) return {
            pourStats: new Big(0),
            percentPrecise: new Big(0),
            percentRounded: new Big(0),
            totalScoreRouned: new Big(0),
            place: 0,
            choiceCount: 0
        }
        const choiceStats = stats.powerByChoiceId[props.choice.id]!
        const pourStats = choiceStats.byScore["Pour"]?.res || new Big(0)
        const percentPrecise = stats.anyTotal.res.gt(0) ? pourStats.div(stats.anyTotal.res).mul(100) : new Big(0)
        const percentRounded = percentPrecise?.round(2)
        const totalScoreRouned = pourStats?.round(2)
        const choiceCount = Object.entries(stats.powerByChoiceId).length
        const place = choiceCount - Object.entries(stats.powerByChoiceId).filter(([key, value]) => {
            if (key === props.choice.id) return true
            const pourStatsOtherChoice = value.byScore["Pour"]?.res || new Big(0)
            return pourStatsOtherChoice.lte(pourStats)
        }).length

        return {
            pourStats,
            percentPrecise,
            percentRounded,
            totalScoreRouned,
            place,
            choiceCount
        }
    }, [props.choice.id, stats])

    // const CopivoteWarning = () => <Button size="compact-xs" variant="transparent" onClick={() => setUserVotes({
    //     voted: [],
    //     copied: []
    // })}>Ne plus copier pour ce vote et voter moi même</Button>

    // const AdvancedVoteWarning = () => <>
    //     <Text>Il semble que vous avez déja utilisé les votes avancés</Text>
    //     <Button size="compact-xs" variant="transparent">Aller a l'onglet votes avancés</Button>
    // </>

    return <Group justify="space-between">
        <Box w={310}>
            <Stack gap={0} >
                <Group justify="space-between"><Text>{props.choice.name}</Text> <Group gap={0}><IconMedal2 size={22} /> <Text>{place + 1}</Text></Group></Group>
                <Group justify="flex-end"><Text size="xs" c="dimmed" span>Pour:
                    &nbsp;
                    <Tooltip label={pourStats.toString()}>
                        <Text span>{totalScoreRouned.toString()}</Text>
                    </Tooltip>
                    &nbsp;
                    (<Tooltip label={pourStats.toString() + " / " + stats?.anyTotal?.res.toString() + " * 100 = " + percentPrecise.toString()}>
                        <Text span>{percentRounded.toString()}%</Text>
                    </Tooltip>)
                </Text></Group>
                <Group gap={0}>
                    <Box h={5} bg={'pirate.4'} w={percentRounded.toNumber() + '%'} />
                    <Box h={1} bg={'pirate.1'} w={(100 - (percentRounded.toNumber() || 0)) + '%'} />
                </Group>
            </Stack>
        </Box>
        <Box w={310} h="100%" pos="relative">
            <Group justify="center">
                <Stack gap={0}>
                    { }
                    <Select
                        data={APPROVAL_SCORE}
                        searchable
                        value={score?.toString()}
                        error={error}
                        onChange={
                            (val) => {
                                //Set the score to "Pour" and keep the other scores
                                const newScores = scores.filter(x => x.forChoiceId !== props.choice.id)//Filter out the previous score
                                if (val) {
                                    newScores.push({
                                        forChoiceId: props.choice.id,
                                        score: val as typeof APPROVAL_SCORE[number],
                                    })
                                }
                                setUserVotes({
                                    voted: [{
                                        scores: newScores,
                                        copiedId: null,
                                        power: VOTE_BASE_POWER,
                                    }],
                                    copied: []
                                })
                            }
                        }
                        renderOption={opt =>
                            <Stack gap={0}>
                                <Text>{opt.option.label}</Text>
                            </Stack>
                        }
                    />
                </Stack>
            </Group>
        </Box>

    </Group>
}

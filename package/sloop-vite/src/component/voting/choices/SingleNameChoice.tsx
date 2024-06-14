import { Box, Group, Radio, Stack, Text, Tooltip } from "@mantine/core";
import { VOTE_BASE_POWER } from "@sloop-express/misc/voting";
import { IconMedal2 } from "@tabler/icons-react";
import Big from "big.js";
import { useMemo } from "react";
import { z } from "zod";
import { ChoiceComponent } from "../VotingConsole";

export const SINGLE_NAME_SCORE = ["Pour", "Contre"] as const

const SingleNameScoresSchema = z.array(z.object({
    scores: z.array(z.object({
        forChoiceId: z.string(),
        score: z.enum(SINGLE_NAME_SCORE)
    })),
    copiedId: z.string().nullable(),
    power: z.number(),
}))


export const SingleNameChoice: ChoiceComponent = (props) => {
    const { stats } = props
    const [userVotes, setUserVotes] = props.usedUserVotes


    const voted = SingleNameScoresSchema.parse(userVotes.voted)
    const scores = voted[0]?.scores || []
    const score = scores.find(x => x.forChoiceId === props.choice.id)?.score ?? null

    const {
        pourStats,
        percentPrecise,
        percentRounded,
        totalScoreRouned,
        place
    } = useMemo(() => {
        if (!stats) return {
            pourStats: new Big(0),
            percentPrecise: new Big(0),
            percentRounded: new Big(0),
            totalScoreRouned: new Big(0),
            place: 0
        }
        const choiceStats = stats.powerByChoiceId[props.choice.id]!
        const pourStats = choiceStats.byScore["Pour"]?.res || new Big(0)
        const percentPrecise = stats.anyTotal.res.gt(0) ? pourStats.div(stats.anyTotal.res).mul(100) : new Big(0)
        const percentRounded = percentPrecise?.round(2)
        const totalScoreRouned = pourStats?.round(2)
        const place = Object.entries(stats.powerByChoiceId).length - Object.entries(stats.powerByChoiceId).filter(([key, value]) => {
            if (key === props.choice.id) return true
            const pourStatsOtherChoice = value.byScore["Pour"]?.res || new Big(0)
            return pourStatsOtherChoice.lte(pourStats)
        }).length

        return {
            pourStats,
            percentPrecise,
            percentRounded,
            totalScoreRouned,
            place
        }
    }, [props.choice.id, stats])

    return <Group justify="space-between" gap={10}>
        <Box w={310}>
            <Stack gap={0} flex={{}}>
                <Group justify="space-between"><Text>{props.choice.name}</Text> <Group gap={0}><IconMedal2 size={22} /> <Text>{place + 1}</Text></Group></Group>
                <Group justify="flex-end"><Text size="xs" c="dimmed" span>Pour:
                    &nbsp;
                    <Tooltip label={pourStats?.toString()}>
                        <Text span>{totalScoreRouned?.toString()}</Text>
                    </Tooltip>
                    &nbsp;
                    (<Tooltip label={pourStats?.toString() + " / " + stats?.anyTotal?.toString() + " * 100 = " + percentPrecise?.toString()}>
                        <Text span>{percentRounded?.toString()}%</Text>
                    </Tooltip>)
                </Text></Group>
                <Group gap={0}>
                    <Box h={5} bg={'pirate.4'} w={percentRounded?.toNumber() + '%'} />
                    <Box h={1} bg={'pirate.1'} w={(100 - (percentRounded?.toNumber() || 0)) + '%'} />
                </Group>
            </Stack>
        </Box>
        <Box w={310}>
            <Group justify="center">
                <Radio
                    checked={score === "Pour"}
                    onChange={(e) => {
                        if (e.target.checked) {
                            //Set the score to "Pour" and all other to "Contre"
                            const newScores = props.voting.choices.map(choice => ({
                                forChoiceId: choice.id,
                                score: choice.id === props.choice.id ? "Pour" : "Contre",
                            }))
                            setUserVotes({
                                voted: [{
                                    scores: newScores,
                                    copiedId: null,
                                    power: VOTE_BASE_POWER,
                                }],
                                copied: []
                            })
                        }
                    }}
                />
            </Group>
        </Box>
    </Group>
}
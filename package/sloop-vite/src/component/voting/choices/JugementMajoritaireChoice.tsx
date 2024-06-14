import { Box, Divider, Group, HoverCard, Select, Space, Stack, Text } from "@mantine/core";
import { VOTE_BASE_POWER } from "@sloop-express/misc/voting";
import { _throw } from "@sloop-vite/utils";
import { IconMedal2 } from "@tabler/icons-react";
import Big from "big.js";
import { useMemo } from "react";
import { z } from "zod";
import { ChoiceComponent } from "../VotingConsole";


export const JUGEMENT_MAJORITAIRE_SCORE_ORDER: Record<JugementMajoritaireScore, number> = {
    'Trés bien': 5,
    'Bien': 4,
    'Assez bien': 3,
    'Passable': 2,
    'Insuffisant': 1,
    'A rejeter': 0,
} as const;

export const JUGEMENT_MAJORITAIRE_SCORES = ["Trés bien", "Bien", "Assez bien", "Passable", "Insuffisant", "A rejeter"] as const

export type JugementMajoritaireScore = typeof JUGEMENT_MAJORITAIRE_SCORES[number];

export const JUGEMENT_MAJORITAIRE_SCORE_COLOR: Record<JugementMajoritaireScore, string> = {
    'Trés bien': 'lime.7',
    'Bien': 'lime.3',
    'Assez bien': 'yellow.5',
    'Passable': 'orange.7',
    'Insuffisant': 'red.7',
    'A rejeter': 'red.9',
    // 'Trés bien': 'pirate.1',
    // 'Bien': 'pirate.2',
    // 'Assez bien': 'pirate.3',
    // 'Passable': 'pirate.4',
    // 'Insuffisant': 'pirate.5',
    // 'A rejeter': 'pirate.6',
} as const;

const JmScoresSchema = z.array(z.object({
    scores: z.array(z.object({
        forChoiceId: z.string(),
        score: z.enum(JUGEMENT_MAJORITAIRE_SCORES)
    })),
    copiedId: z.string().nullable(),
    power: z.number(),
}))


export const JugementMajoritaireChoice: ChoiceComponent = (props) => {
    const { stats } = props
    const [userVotes, setUserVotes] = props.usedUserVotes

    const voted = JmScoresSchema.parse(userVotes.voted)
    const scores = voted[0]?.scores || []
    const score = scores.find(x => x.forChoiceId === props.choice.id)?.score ?? null

    const { mentionsMajoritaire, place, scorePercent } = useMemo(() => {
        if (!stats) return {
            scorePercent: {} as Record<JugementMajoritaireScore, Big>,
            isBest: false,
            place: 0,
            mentionsMajoritaire: [] as JugementMajoritaireScore[],
        }
        const choiceStats = stats?.powerByChoiceId[props.choice.id] || _throw("No stats for choice")

        const mentionsMajoritaire = computeMentionsMajoritaire(choiceStats)
        const otherChoiceMentionsMajoritaire = Object.entries(stats.powerByChoiceId).filter(([choiceId,]) => choiceId != props.choice.id).map(([, compareToStats]) => {
            return computeMentionsMajoritaire(compareToStats)
        })

        const place = otherChoiceMentionsMajoritaire.length - otherChoiceMentionsMajoritaire.filter((otherMentionsMajortaires) => gt(mentionsMajoritaire, otherMentionsMajortaires)).length

        const scorePercent = Object.fromEntries(Object.entries(choiceStats.byScore).map(
            ([mention, count]) => {
                return [
                    mention,
                    choiceStats?.total?.res.gt(0) ? count.res.div(choiceStats?.total.res).mul(100) : new Big(0)
                ]
            }
        ))
        return { mentionsMajoritaire, place, scorePercent }
    }, [props.choice.id, props.choice.name, stats])

    return <Group justify="space-between" gap={10}>
        <Box w={310}>
            <Stack gap={0} flex={{}}>
                <Group justify="space-between"><Text>{props.choice.name}</Text> <Group gap={0}><IconMedal2 size={22} /> <Text>{place + 1}</Text></Group></Group>
                <Stack gap={0}>
                    <HoverCard>
                        <HoverCard.Target>
                            <Group justify="end"><Text size="xs" c="dimmed" span>{mentionsMajoritaire.join(", ") || "Aucun"}</Text></Group>
                        </HoverCard.Target>
                        <HoverCard.Dropdown>
                            <Group gap={10}>
                                WIP
                            </Group>
                        </HoverCard.Dropdown>

                    </HoverCard>
                    <Group gap={0}>
                        <Box w={0} h={12}></Box>
                        {
                            JUGEMENT_MAJORITAIRE_SCORES.map((mention) => (
                                <Box h={(JUGEMENT_MAJORITAIRE_SCORES.length - mentionsMajoritaire.findIndex(m => m === mention)) * 2} bg={JUGEMENT_MAJORITAIRE_SCORE_COLOR[mention]} w={(scorePercent[mention]?.round(2, Big.roundDown).toString() || '0') + '%'} size='md' />
                            ))
                        }
                    </Group>
                    <Box style={{
                        borderRight: '1px solid',
                    }} w="50%">
                        <Group justify="right"><Text size="xs" c="dimmed" span>50%</Text></Group>
                    </Box>
                </Stack>
            </Stack >
        </Box >
        <Box w={310}>
            <Group justify="center">
                <Stack gap={0}>

                    <Select
                        data={JUGEMENT_MAJORITAIRE_SCORES}
                        searchable
                        value={score?.toString() || null}
                        onChange={
                            (val) => {
                                //Set the score to the selected value
                                const newScores = scores.filter(x => x.forChoiceId !== props.choice.id)//Filter out the previous score
                                if (val) {
                                    newScores.push({
                                        forChoiceId: props.choice.id,
                                        score: val as JugementMajoritaireScore,
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
                                <Divider size={3} color={JUGEMENT_MAJORITAIRE_SCORE_COLOR[opt.option.label as JugementMajoritaireScore]} />
                            </Stack>
                        }
                    />
                    {
                        score
                            ? <Divider size={3} color={JUGEMENT_MAJORITAIRE_SCORE_COLOR[score]} />
                            : <Space h={3} />
                    }
                </Stack>
            </Group>
        </Box>
    </Group >
}

function gt(
    mentionsMajoritaire: JugementMajoritaireScore[],
    otherChoiceMentionsMajoritaire: JugementMajoritaireScore[]
) {
    for (let i = 0; mentionsMajoritaire[i] && otherChoiceMentionsMajoritaire[i]; i++) {
        const mentionOrder = JUGEMENT_MAJORITAIRE_SCORE_ORDER[mentionsMajoritaire[i]!]
        const otherChoiceMentionOrder = JUGEMENT_MAJORITAIRE_SCORE_ORDER[otherChoiceMentionsMajoritaire[i]!]
        if (mentionOrder != otherChoiceMentionOrder) {
            return mentionOrder > otherChoiceMentionOrder
        } else {
            // If the mentions are the same, we continue to the next one
        }
    }
    return true
}

function computeMentionsMajoritaire(choiceStats: Exclude<Parameters<ChoiceComponent>[0]['stats'], null>['powerByChoiceId'][string], previousMentions: JugementMajoritaireScore[] = []) {
    const mentionCounts = choiceStats.byScore
    const remaining = Object.entries(mentionCounts).filter(([mention]) => !previousMentions.includes(mention as JugementMajoritaireScore))
    if (remaining.length === 0) {
        return previousMentions
    }
    const countTotal = remaining.reduce((acc, [, count]) => acc.add(count.res), new Big(0));
    const sortedFilteredMentions = JUGEMENT_MAJORITAIRE_SCORES
        .filter((mention) => !previousMentions.includes(mention as JugementMajoritaireScore))
        .sort((mention1, mention2) => JUGEMENT_MAJORITAIRE_SCORE_ORDER[mention1] - JUGEMENT_MAJORITAIRE_SCORE_ORDER[mention2])

    let lowerBound = new Big(0)
    const half = countTotal.div(2)
    for (const mention of sortedFilteredMentions) {
        const count = mentionCounts[mention]?.res || new Big(0)
        const higherBound = lowerBound.add(count)
        if (higherBound.gt(half)) {
            return computeMentionsMajoritaire(choiceStats, [...previousMentions, mention])
        }
        lowerBound = higherBound
    }
    throw new Error("Should not happen")
}
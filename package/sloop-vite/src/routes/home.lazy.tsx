import { ActionIcon, Box, Button, Card, Container, Divider, Group, Popover, Space, Stack, Switch, Text, Timeline, Title, Tooltip } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { MainLayout } from "@sloop-vite/MainLayout";
import { trpcReact } from "@sloop-vite/misc/trpc";
import { IconArrowRight, IconCalendar, IconCalendarMonth, IconCalendarWeek, IconMoodSmile, IconSettings } from "@tabler/icons-react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Planning } from "../component/Planning";
import { TimeUnit } from "../misc/date";

export const Route = createLazyFileRoute('/home')({
    component: () => <MainLayout><Home /></MainLayout>
})

export function Home() {
    return (
        <Container fluid>
            {/* <Group>
                <Stat
                    label={<Text><Tooltip label='Pouvoir de votes'>PV</Tooltip>recus</Text>}
                    value={350}
                />
                <Stat
                    label={<Text><Tooltip label='Pouvoir de votes'>PV</Tooltip>recus</Text>}
                    value={350}
                />
                <Stat />
                <Stack>
                
                    <Button>Déléguer mes votes</Button>
                    <Button rightSection={<IconArrowRight size={14} />}>12 vote en cours</Button>
                </Stack>
            </Group> */}
            <Group justify="flex-start" align="flex-start">
                <Box mt={15}>
                    <Card shadow="sm">
                        <Title order={6}>Assemblée permanente d'Avril</Title>
                    </Card>
                    <Box w={360} mt={15}>
                        <AssembleePermanentTimeline />
                    </Box>
                </Box>
                <Space w={15} />
                <Divider orientation="vertical" h='250' />
                <Space w={15} />
                <PlanningSection />
                {/* <Box><Agenda /></Box> */}
            </Group >
        </Container >
    );
}

function PlanningSection() {
    const meetings = trpcReact.meeting.getAll.useQuery().data ?? [];//TODO: loading
    const [splitTimeUnit, setSplitTimeUnit] = useLocalStorage<TimeUnit>({
        key: 'home-planning-time-unit',
        defaultValue: 'day',
    });
    const [showEmpty, setShowEmpty] = useLocalStorage<boolean>({
        key: 'home-planning-show-empty',
        defaultValue: true,
    });

    return <Box mt={15}>

        <Card shadow="sm" style={{ zIndex: 10 }}>
            <Group justify="space-between">
                <Title order={6}>Vos réunions a venir</Title>
                <Popover position="bottom" withArrow shadow="md">
                    <Popover.Target>
                        <ActionIcon variant="subtle" size={'sm'}><IconSettings /></ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown>
                        <TimeUnitActionGroup
                            usedSplitTimeUnit={[splitTimeUnit, setSplitTimeUnit]}
                            usedShowEmpty={[showEmpty, setShowEmpty]} />
                    </Popover.Dropdown>
                </Popover>

            </Group>
        </Card>
        <Box>
            <Planning meetings={meetings} splitBy={splitTimeUnit} showEmpty={showEmpty} />
        </Box>
    </Box>;
}

function TimeUnitActionGroup({ usedSplitTimeUnit, usedShowEmpty }: {
    usedSplitTimeUnit: [TimeUnit, (t: TimeUnit) => void]
    usedShowEmpty: [boolean, (t: boolean) => void]
}) {
    const [splitTimeUnit, setSplitTimeUnit] = usedSplitTimeUnit;
    const [showEmpty, setShowEmpty] = usedShowEmpty;
    return <Stack>
        <Box>
            Afficher par:
            <Group justify="space-evenly">
                <Tooltip label="Jour">
                    <ActionIcon aria-label="Jour" variant={splitTimeUnit === 'day' ? 'filled' : 'subtle'} onClick={() => setSplitTimeUnit('day')} >
                        <IconCalendar />
                    </ActionIcon>
                </Tooltip>
                <Tooltip label="Semaine">
                    <ActionIcon aria-label="Semaine" variant={splitTimeUnit === 'week' ? 'filled' : 'subtle'} onClick={() => setSplitTimeUnit('week')}><IconCalendarWeek /></ActionIcon>
                </Tooltip>
                <Tooltip label="Mois">
                    <ActionIcon aria-label="Mois" variant={splitTimeUnit === 'month' ? 'filled' : 'subtle'} onClick={() => setSplitTimeUnit('month')}><IconCalendarMonth /></ActionIcon>
                </Tooltip>
            </Group>
        </Box>
        <Switch
            label={<>Afficher les {splitTimeUnit} vide </>}
            checked={showEmpty}
            onChange={(event) => setShowEmpty(event.currentTarget.checked)}
        />
    </Stack>;
}


function AssembleePermanentTimeline() {
    const [value, setValue] = useState<number>(1);
    const num = value % 4;

    return (
        <>
            <Timeline active={num} bulletSize={24} lineWidth={1} onClick={() => setValue(value + 1)}>
                <Timeline.Item bullet={<Text size="xs">S1</Text>} title="Dépot des motions" >
                    <Text size="xs" mt={4}>Du <Text span fw={500}>lundi 25 mai</Text> - au <Text span fw={500}>dimanche 35 mai</Text></Text>
                    <Text c="dimmed" size="sm" >C'est la que tout les pirates font leurs propositions qui seront mises au vote. Dans le jargon ces propositions sont appelés des motions</Text>
                    <Button autoContrast disabled={num < 0} mt={10} rightSection={<IconArrowRight size={14} />}>Proposer</Button>
                </Timeline.Item>
                <Timeline.Item bullet={<Text size="xs">S2</Text>} title="Débat - Smn 1">
                    <Text size="xs" mt={4}>Du <Text span fw={500}>lundi 25 mai</Text> - au <Text span fw={500}>dimanche 35 mai</Text></Text>
                    <Text c="dimmed" size="sm">Vu qu'une bonne démocratie n'échappe pas a de bons débats</Text>
                    <Button autoContrast disabled={num < 1} variant="light" mt={10} rightSection={<IconArrowRight size={14} />}>Débattre</Button>
                </Timeline.Item>
                <Timeline.Item bullet={<Text size="xs">S3</Text>} title="Débat - Smn 2">
                    <Text size="xs" mt={4}>Du <Text span fw={500}>lundi 25 mai</Text> - au <Text span fw={500}>dimanche 35 mai</Text></Text>
                    <Text c="dimmed" size="sm">Et qu'on adore ca au partie pirate...</Text>
                    <Button autoContrast disabled={num < 2} variant="light" mt={10} rightSection={<IconArrowRight size={14} />}>Débattre</Button>
                </Timeline.Item>
                <Timeline.Item bullet={<Text size="xs">S4</Text>} title="A vos bulletins">
                    <Text size="xs" mt={4}>Du <Text span fw={500}>lundi 25 mai</Text> - au <Text span fw={500}>dimanche 35 mai</Text></Text>
                    <Text c="dimmed" size="sm">Le moment que vous attendez tous <IconMoodSmile /> </Text>
                    <Button autoContrast disabled={num < 3} mt={10} size="lg" rightSection={<IconArrowRight size={14} />}>Voter</Button>
                </Timeline.Item>
            </Timeline >
        </>
    );
}
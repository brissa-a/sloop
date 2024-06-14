import { Box, Center, Group, Stack, Text, Title } from "@mantine/core";
import { VotingConsole } from "@sloop-vite/component/voting/VotingConsole"
import { trpcReact } from "@sloop-vite/misc/trpc";
import { IconAppWindow } from "@tabler/icons-react";

export function GroupVotingConsole(props: {
    group: {
        id: string,
        slug: string
    }
}) {
    const group = trpcReact.group.byId.useQuery({ id: props.group.id }).data;
    console.log({ group })
    if (!group) return <Center>Group introuvable</Center>
    return <Box h="100vh"><VotingConsole votingIds={(group || []).votings.map(({ id }) => id)} title={
        <Stack gap={0}>
            <Text c='dimmed' size='sm'>Console de vote du groupe:</Text>
            <Group><IconAppWindow size={30} /><Title order={2}>{group.name}</Title></Group>
        </Stack>
    } /></Box>
}
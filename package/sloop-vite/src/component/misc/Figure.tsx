import { Group, Paper, Text } from '@mantine/core';



export function Stat({ label, value }: { label: string | JSX.Element, value: number }) {

    return (
        <Paper withBorder p="md" radius="md" w={200}>
            <Group justify="apart">
                < div >
                    <Text c="dimmed" tt="uppercase" fw={700} fz="xs">
                        {label}
                    </Text>
                    <Text fw={700} fz="xl">
                        {value}
                    </Text>
                </div >
            </Group >
        </Paper >
    );
}
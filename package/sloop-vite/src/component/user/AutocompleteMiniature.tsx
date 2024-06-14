import { Avatar, Group, Skeleton, Text } from "@mantine/core";
import { trpcReact } from "@sloop-vite/misc/trpc";
import ms from "ms";


export const AutocompleteMiniature = ({ userId }: { userId: string }) => {
    const user = trpcReact.user.byId.useQuery({ id: userId }, { staleTime: ms('5m') }).data;

    if (!user) return <Group gap="sm">
        <Skeleton height={30} circle />
        <Text>
            <Skeleton width={100} height={20} />
        </Text>
    </Group>
    return (
        <Group gap="sm">
            <Avatar size={30} src={user.avatarUrl} radius={30} />
            <Text fz="sm" fw={500}>
                {user.username}
            </Text>
        </Group>
    )
}

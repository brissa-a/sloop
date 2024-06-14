import { Avatar, Group, HoverCard, AvatarProps as MantineAvatarProps, Stack, Text, useMantineColorScheme } from "@mantine/core";
import { trpcReact } from "@sloop-vite/misc/trpc";
import { Link } from "@tanstack/react-router";
import { UserHoverCard } from "./UserHoverCard";
import ms from "ms";

export const InlineUser = ({ userId, ...remain }: { userId: string } & MantineAvatarProps) => {
    const user = trpcReact.user.byId.useQuery({ id: userId }, {
        staleTime: ms('5m')
    }).data;
    const { colorScheme } = useMantineColorScheme();
    if (!user) return <Avatar {...remain} />

    return <HoverCard position="bottom" withArrow shadow="md" openDelay={200} closeDelay={100}>
        <HoverCard.Target>
            <Group gap="xs">
                <Avatar src={user.avatarUrl} size="sm" />
                <Stack gap={0}>
                    <Text fw={500} c={colorScheme === 'dark' ? 'pirate.3' : 'pirate.6'}
                        onClick={() => close()}
                        renderRoot={(props) => {
                            return <Link to='/user/$id/$slug' params={{ id: user.id, slug: user.slug || "unknown" }} {...props} />
                        }}
                    >{user.username}</Text>
                    {/* <Text size="xs" c="dimmed">@{user.slug}</Text> */}
                    <Text size="xs" c="dimmed">@{user.id.replace('-', '\u2011')}</Text>
                </Stack>
            </Group>
        </HoverCard.Target>
        <HoverCard.Dropdown w={400} >
            <UserHoverCard user={user} />
        </HoverCard.Dropdown>
    </HoverCard >;
};

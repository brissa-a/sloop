import { HoverCard, AvatarProps as MantineAvatarProps, Text, useMantineColorScheme } from "@mantine/core";
import { trpcReact } from "@sloop-vite/misc/trpc";
import { Link } from "@tanstack/react-router";

export const InlineGroup = ({ groupId }: { groupId: string } & MantineAvatarProps) => {
    const group = trpcReact.group.byId.useQuery({ id: groupId }).data;
    const { colorScheme } = useMantineColorScheme();
    if (!group) return <>{groupId}</>

    return <HoverCard position="bottom" withArrow shadow="md" openDelay={200} closeDelay={100}>
        <HoverCard.Target>
            <Text fw={500} c={colorScheme === 'dark' ? 'pirate.3' : 'pirate.6'}
                onClick={() => close()}
                renderRoot={(props) => {
                    return <Link to='/group/$id/$slug' params={{ id: group.id, slug: group.slug || "unknown" }} {...props} />
                }}
            >#{group.slug}</Text>
        </HoverCard.Target>
        <HoverCard.Dropdown w={400} >
            {group.name}
        </HoverCard.Dropdown>
    </HoverCard >;
};
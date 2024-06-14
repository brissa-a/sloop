import { Avatar, HoverCard, Avatar as MantineAvatar, AvatarProps as MantineAvatarProps } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { trpcReact } from "@sloop-vite/misc/trpc";
import { Link } from "@tanstack/react-router";
import { UserHoverCard } from "./UserHoverCard";
import ms from "ms";

type AvatarProps = { userId: string | null } & MantineAvatarProps;

export const SloopAvatar = ({ userId, ...remain }: AvatarProps) => {
    if (!userId) return <Avatar {...remain} />
    else return <SloopAvatar2 userId={userId} {...remain} />
}

const SloopAvatar2 = ({ userId, ...remain }: { userId: string } & MantineAvatarProps) => {
    const [opened, { open, close }] = useDisclosure();
    const style = opened ? { transform: "scale(1.30)" } : {};
    const user = trpcReact.user.byId.useQuery({ id: userId }, {
        staleTime: ms('5m')
    }).data;
    if (!user) return <Avatar {...remain} />


    return <HoverCard position="bottom" withArrow shadow="md" openDelay={200} closeDelay={100} onOpen={open} onClose={close}>
        <HoverCard.Target>
            <MantineAvatar
                renderRoot={(props) => {
                    return <Link to='/user/$id/$slug' params={{ id: user.id, slug: user.slug || "unknown" }} {...props} />
                }}
                {...remain} src={user.avatarUrl} style={style} />
        </HoverCard.Target>
        <HoverCard.Dropdown w={400} >
            <UserHoverCard user={user} />
        </HoverCard.Dropdown>
    </HoverCard >;
};
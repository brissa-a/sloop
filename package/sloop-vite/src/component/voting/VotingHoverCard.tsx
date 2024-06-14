import { Badge, Box, Button, Flex, Group, Avatar as MantineAvatar, AvatarProps as MantineAvatarProps, Stack, Text } from "@mantine/core";
import { isBetweenStartAndExpiration } from "@sloop-express/misc/membership";
import { AppRouter } from "@sloop-express/trpc";
import { useSloop } from "@sloop-vite/hooks/sloop";
import { privilegeColor } from "@sloop-vite/misc/privilege-color";
import { trpcReact } from "@sloop-vite/misc/trpc";
import { _throw } from "@sloop-vite/utils";
import { Link } from "@tanstack/react-router";
import { inferProcedureOutput } from "@trpc/server";

type HoverCardProps = { user: Exclude<inferProcedureOutput<AppRouter['_def']['procedures']['user']['byId']>, null> } & MantineAvatarProps;

export const VotingHoverCard = ({ user, ...remain }: HoverCardProps) => {
    const { isAdmin } = useSloop()
    const groups = user?.groupMembership.filter(isBetweenStartAndExpiration).map(g => ({ ...g.group, role: g.role })) || []

    const LoginAs = () => {
        const logAs = trpcReact.user.logAs.useMutation().mutate


        return <Group component="section">
            <Button color={privilegeColor.admin} size="compact-xs" onClick={() => logAs({
                substitutedUserId: user.id,
                forwardAdmin: false
            })}>Login as</Button>
            <Button color={privilegeColor.admin} size="compact-xs" onClick={() => logAs({
                substitutedUserId: user.id,
                forwardAdmin: true
            })}>Login as (keep Admin)</Button>
        </Group>
    }

    return <Stack gap={0}>
        {isAdmin && <Group justify="center" mb={10}><LoginAs /></Group>}
        <Group>
            <MantineAvatar component='button' {...remain} src={user.avatarUrl} size={70} />
            <Stack gap={0}>
                <Text span size="lg">
                    {user.username}
                </Text>
                <Text span size="xs" c="dimmed">
                    @{user.slug}
                </Text>
                <Group>
                    <Stack gap={0}>
                        <Text size="xs" c='dimmed'>PV</Text>
                        <Text size='sm'>136</Text>
                    </Stack>
                    <Stack gap={0}>
                        <Text size="xs" c='dimmed'>Membre depuis</Text>
                        <Text size='sm'>29/03/2012</Text>
                    </Stack>
                    <Stack gap={0}>
                        <Text size="xs" c='dimmed'>Réunions participés<br />ces 30 derniers jours</Text>
                        <Text size='sm'>4</Text>
                    </Stack>
                </Group>
            </Stack>
        </Group>
        <Flex my={10} wrap={'wrap'} justify={'center'}>
            {user.isAdmin ? <Box m={2}><Badge color={privilegeColor.admin}>admin</Badge></Box> : null}
            {groups.map(({ slug, id, role }) => <Badge m={2} key={slug} ml={10} style={{ cursor: 'pointer' }}
                renderRoot={(props) => {
                    return <Link to='/group/$id/$slug' params={{ id, slug }} {...props} />
                }}
                color={role === "CAPTAIN" ? privilegeColor.captain : role === "MEMBER" ? privilegeColor.member : _throw('role required')}
                onClick={e => e.stopPropagation()}
            >#{slug}</Badge>)}
        </Flex>
    </Stack >
}


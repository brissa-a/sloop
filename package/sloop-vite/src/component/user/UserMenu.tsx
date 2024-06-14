import { Avatar, Badge, Box, Button, Group, Menu, Stack, Text, UnstyledButton, rem } from "@mantine/core";
import { privilegeColor } from "@sloop-vite/misc/privilege-color";
import { _throw } from "@sloop-vite/utils";
import { IconChevronRight, IconLogout, IconSettings } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useSloop } from "../../hooks/sloop";
import { LoginAction } from "./LoginAction";


export const UserMenu = () => {
    const { user, isAdmin, principal, logout } = useSloop();

    console.log('user', user)
    if (!user) return <Box aria-label="user menu">
        <Stack gap="xs" h={70}>
            <LoginAction button={props => {
                return <Button {...props} variant="default" size="xs">S'identifier</Button>
            }} startingValues={{}} />

            <Button size="xs">Devenir membre</Button>
        </Stack>
    </Box>;
    else
        return <Stack h={70} w="100%" justify="center">
            <Menu shadow="md" width={200} position="right-start">
                <Menu.Target>

                    <UnstyledButton aria-label="user menu">
                        <Group justify="space-between">
                            <Group>
                                <Stack gap={0}>
                                    {isAdmin && <Badge size='xs' color={privilegeColor.admin}>admin</Badge>}
                                    <Avatar src={user.avatarUrl} />
                                </Stack>
                                <Stack gap={0}>
                                    <Text c='dimmed' size='xs'>Logged as:</Text>
                                    <Text visibleFrom="sm">{user.username}</Text>
                                    {principal?.id != user.id && <Text c='dimmed' size='xs' truncate w="22ch">principal: {principal?.confidential?.email}</Text>}
                                </Stack>
                            </Group>
                            <IconChevronRight size={18} />
                        </Group>
                    </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown w={320}>
                    <Menu.Label>Application</Menu.Label>

                    <Menu.Item renderRoot={(props) => {
                        return <Link to='/user/$id/$slug' params={{ id: user.id, slug: user.slug || _throw('slug required') }} {...props} />
                    }} leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}>
                        Mon profil
                    </Menu.Item>
                    <Menu.Item leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}>
                        Mes copies
                    </Menu.Item>
                    <Group justify="space-between">
                        <Menu.Label>Section:</Menu.Label>
                        <Group gap={1}>
                            <Badge color={privilegeColor.admin} variant="light" size="xs">Admin</Badge>
                        </Group>
                    </Group>
                    <Menu.Item leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}>
                        Utilisateurs
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item onClick={() => logout()} leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}>
                        Logout
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu >
        </Stack >;
};
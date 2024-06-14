import { ActionIcon, AppShell, Badge, Center, Divider, Group, Menu, NavLink, NavLinkStylesNames, ScrollArea, Space, Stack, Text, Tooltip, useMantineColorScheme } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { isBetweenStartAndExpiration } from '@sloop-express/misc/membership';
import { IconCalendar, IconHash, IconMoon, IconPlus, IconSettings, IconSun, IconUsers } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import _ from 'lodash';
import React, { CSSProperties } from 'react';
import { UserMenu } from './component/user/UserMenu';
import { NavBarContext } from './hooks/navbar';
import { useSloop } from './hooks/sloop';
import Logo from './logo.svg?react';
import { TrpcOut, trpcReact } from './misc/trpc';
import { notifications } from '@mantine/notifications';
import { CreateGroupModal } from './component/group/CreateGroupModal';
import ms from 'ms';


export function MainLayout({ children }: { children: React.ReactNode }) {
  const disclosure = useDisclosure();
  const [opened, { close }] = disclosure;
  const { colorScheme } = useMantineColorScheme();
  const bg = colorScheme === 'light' ? '#FCFAFD' : '#1E1F21';
  const isSm = useMediaQuery('(max-width: 768px)');

  // const sendMessage = () => {
  //   ws && ws.send('Hello Server!');
  // };

  const createGroupDisclosure = useDisclosure();
  const [, { open: openCreateGroupModal }] = createGroupDisclosure;

  return (
    <AppShell
      navbar={{
        width: { base: 300, md: 300, lg: 300 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}

      padding="md"
    >
      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Group justify='space-between'>
            <Text fw={600}>Parti Pirate</Text>
            <CreateGroupModal startingValues={{}} usedDisclosure={createGroupDisclosure} />
            <Menu position='bottom-start'>
              <Menu.Target>
                <ActionIcon variant='subtle' title="Configuration de l'application" size="sm"><IconSettings /> </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown >
                <Menu.Label>Configuration de l'application</Menu.Label>
                <Menu.Item leftSection={<IconPlus size="1rem" />} onClick={openCreateGroupModal}>Créer un groupe</Menu.Item>
                <Menu.Item leftSection={<IconUsers size="1rem" />} onClick={() => notifications.show({
                  title: 'WIP',
                  message: 'Cette fonctionnalité est en cours de développement',
                })}>Voir tous les utilisateurs</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </AppShell.Section>
        <Space h={10} />
        <AppShell.Section>
          <UserMenu />
        </AppShell.Section>
        <Space h={10} />
        <Divider />
        <AppShell.Section>
          <NavLink active={window.location.pathname === "/"} leftSection={<IconCalendar />} renderRoot={(props) => {
            return <Link to='/' {...props} />
          }} label="Mon agenda" />
        </AppShell.Section>
        <Divider />
        <AppShell.Section grow my="md" component={ScrollArea} scrollbarSize={2}>

          {/* <NavLink active={window.location.pathname === "/vote-console"} leftSection={<IconAppWindow />} renderRoot={(props) => {
            return <Link to='/voting-console' {...props} />
          }} label="Ma console de vote" /> */}
          <GroupLinks close={isSm ? close : undefined} />
        </AppShell.Section>
        <AppShell.Section>
          <Group justify='space-between'>
            <DarkThemeSwitch />
            <Tooltip label="All you need to sails the liquid democratie" position='right-start' withArrow>
              <Stack gap={0}>
                <Text size='xs'>Power by:</Text>
                <Group gap={'xs'}>
                  <Logo width={20} height={20} />
                  <Text visibleFrom='xs'>Sloop</Text>
                </Group>
              </Stack>
            </Tooltip>

          </Group>
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main bg={bg}>
        <NavBarContext.Provider value={disclosure}>
          {children}
        </NavBarContext.Provider>
      </AppShell.Main>
    </AppShell >);
}

const navLinkBaseStyles: Partial<Record<NavLinkStylesNames, CSSProperties>> = {
  root: {
    padding: 0,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
  section: {
    margin: 0,
  }
};

function DarkThemeSwitch() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };
  return <ActionIcon variant="outline" aria-label="toggle dark mode" onClick={toggleColorScheme}>
    {colorScheme === 'dark' ?
      <IconSun style={{ width: '70%', height: '70%' }} stroke={1.5} /> :
      <IconMoon style={{ width: '70%', height: '70%' }} stroke={1.5} />
    }
  </ActionIcon>;
}

function GroupLinks({ close }: { close?: () => void }) {
  const { user: jwtUser } = useSloop();
  const groups = trpcReact.group.list.useQuery().data;
  const user = trpcReact.user.byId.useQuery({
    id: jwtUser?.id || "we-dont-care-its-disabled"
  }, {
    enabled: jwtUser !== undefined,
    staleTime: ms('5m')
  }).data;

  if (groups === undefined) return (<>Loading</>);
  const joinedGroupSlug = user?.groupMembership.filter(isBetweenStartAndExpiration).map(x => x.group.slug) || [];
  const [myGroup, otherGroups] = _.partition(groups, group => joinedGroupSlug.includes(group.slug));
  const myGroupLinks = myGroup.map(group => <GroupLink key={group.id} group={group} userIsIn={true} close={close} />);
  const otherGroupLinks = otherGroups.map(group => <GroupLink key={group.id} group={group} userIsIn={false} close={close} />);
  return <>
    <AppShell.Section>
      <Text size='xs' c='dimmed'>Mes groupes</Text>
      {myGroupLinks.length ? myGroupLinks : <>
        <Space h={10} />
        <Center><Text size='xs' c='dimmed'>Vous n'avez rejoin aucun groupe</Text></Center>
      </>}
    </AppShell.Section>
    <Space h={10} />
    <AppShell.Section>
      <Text size='xs' c='dimmed'>Autres groupes</Text>
      {otherGroupLinks}
    </AppShell.Section>
    <Space h={10} />
    <AppShell.Section>
      <Text size='xs' c='dimmed'>Groupes archivée</Text>
      WIP
    </AppShell.Section>
  </>
}

function GroupLink({ group, close }: { group: TrpcOut['group']['list'][number], userIsIn: boolean, close: (() => void) | undefined }) {
  const active = window.location.pathname.startsWith(`/group/${group.id}/${group.slug}`);
  const unseen = trpcReact.unseen.get.useQuery().data;
  if (unseen === undefined) return (<>Loading</>);
  const unseenProposalCount = unseen.unseenProposal.reduce((acc, proposal) => proposal.groupId === group.id ? acc + 1 : acc, 0);
  const unseenVotingCount = unseen.unseenVoting.reduce((acc, voting) => voting.groupId === group.id ? acc + 1 : acc, 0);
  const unseenMeetingCount = unseen.unseenMeeting.reduce((acc, meeting) => meeting.groupId === group.id ? acc + 1 : acc, 0);
  const unseenTotal = unseenProposalCount + unseenVotingCount + unseenMeetingCount;

  // const unseenStyle = unseenTotal ? {
  //   label: {
  //     fontWeight: 800,
  //   }
  // } : {}
  // const navLinkStyles = {
  //   ...navLinkBaseStyles,
  //   ...unseenStyle
  // }
  return <NavLink
    styles={navLinkBaseStyles}
    active={active}
    leftSection={<IconHash size='1rem' />} rightSection={unseenTotal ? <Badge>{unseenTotal}</Badge> : null} label={group.name}
    renderRoot={(props) => {
      return <Link to={`/group/${group.id}/${group.slug}`} resetScroll={true} {...props} />
    }}
    onClick={() => close && close()}
  />
}


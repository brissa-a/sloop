import { ActionIcon, Badge, Burger, Button, Center, Container, Group, Menu, Tabs, Text, Title } from "@mantine/core";

import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { CreateProposalModal } from "@sloop-vite/component/proposal/CreateProposalModal";
import { CreateVotingModal } from "@sloop-vite/component/voting/CreateVotingModal";
import { useNavbar } from "@sloop-vite/hooks/navbar";
import { IconCopyvote } from "@sloop-vite/icon/IconCopyvote";
import { IconProposal } from "@sloop-vite/icon/IconProposal";
import { IconVote } from "@sloop-vite/icon/IconVote";
import { trpcReact } from "@sloop-vite/misc/trpc";
import { IconAppWindow, IconCalendar, IconHash, IconHome, IconPlus, IconUsers } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { CreateMeetingModal } from "../../meeting/CreateMeetingModalButton";
import { JoinLeaveButton } from "../JoinLeaveButton";

const possibleTabs = ['home', 'agenda', 'membership', 'voting-console', 'copyvote', 'proposal'] as const
type PossibleTabs = typeof possibleTabs[number]

type TabDef = {
    title: string,
    slug: PossibleTabs,
    icon: React.ReactNode,
    unseens: number,
    navigate: () => void
    wip?: true,
}[]

export const GroupPage = (props: { group: { id: string, slug: string }, activeTab: PossibleTabs, children: React.ReactNode }) => {
    const { group: { id }, activeTab } = props;
    const groupFetcher = trpcReact.group.byId.useQuery({ id });
    const group = groupFetcher.data;
    const navigate = useNavigate()
    const unseen = trpcReact.unseen.get.useQuery().data


    const votingDisclosure = useDisclosure()
    const [, { open: openVotingModal }] = votingDisclosure
    const proposalDisclosure = useDisclosure()
    const [, { open: openProposalModal }] = proposalDisclosure
    const meetingDisclosure = useDisclosure()
    const [, { open: openMeetingModal }] = meetingDisclosure

    const [navbarOpen, { toggle: toggleNavbar }] = useNavbar()
    const showTabLabels = useMediaQuery('(min-width: 1200px)');
    const showButtonLabels = useMediaQuery('(min-width: 800px)');
    const showActiveTabLabels = useMediaQuery('(min-width: 504px)');

    if (!group) return groupFetcher.isFetching ? <Center>Chargement...</Center> : <Center>Erreur</Center>

    const tabs: TabDef = [
        {
            title: 'Accueil',
            slug: 'home',
            icon: <IconHome />,
            unseens: 0,
            navigate: () => navigate({
                to: "/group/$id/$slug/home",
                params: {
                    id: group.id,
                    slug: group.slug,
                }
            }),
            wip: true,
        },
        {
            title: 'Agenda',
            slug: 'agenda',
            icon: <IconCalendar />,
            unseens: unseen?.unseenMeeting.length || 0,
            navigate: () => navigate({
                to: "/group/$id/$slug/agenda",
                params: {
                    id: group.id,
                    slug: group.slug,
                }
            })
        },
        {
            title: 'Console de vote',
            slug: 'voting-console',
            icon: <IconAppWindow />,
            unseens: unseen?.unseenVoting.length || 0,
            navigate: () => navigate({
                to: "/group/$id/$slug/voting-console",
                params: {
                    id: group.id,
                    slug: group.slug,
                }
            })
        },
        {
            title: 'Adhesions',
            slug: 'membership',
            icon: <IconUsers />,
            unseens: 0,
            navigate: () => navigate({
                to: "/group/$id/$slug/membership",
                params: {
                    id: group.id,
                    slug: group.slug,
                }
            })
        },
        {
            title: 'Copivote',
            slug: 'copyvote',
            icon: <IconCopyvote />,
            unseens: 0,
            navigate: () => navigate({
                to: "/group/$id/$slug/copyvote",
                params: {
                    id: group.id,
                    slug: group.slug,
                }
            })
        },
        {
            title: 'Proposition',
            slug: 'proposal',
            icon: <IconProposal />,
            unseens: unseen?.unseenProposal.filter(x => x.groupId === group.id).length || 0,
            navigate: () => navigate({
                to: "/group/$id/$slug/proposal",
                params: {
                    id: group.id,
                    slug: group.slug,
                }
            })
        }
    ]


    return <>
        <CreateVotingModal startingValues={{ groupId: group.id }} usedDisclosure={votingDisclosure} />
        <CreateProposalModal startingValues={{ groupId: group.id }} usedDisclosure={proposalDisclosure} />
        <CreateMeetingModal startingValues={{ groupId: group.id }} usedDisclosure={meetingDisclosure} />
        <Tabs defaultValue={activeTab}>
            <Group justify="space-between">
                <Group>
                    <Burger opened={navbarOpen} onClick={toggleNavbar} hiddenFrom="sm" size="sm" />
                    <Group gap="xs"><IconHash size={15} /><Title order={6} >{group?.name}</Title></Group>
                </Group>
                <Group justify="right">
                    <JoinLeaveButton group={group} showButtonLabels={showButtonLabels} />
                    <Menu withArrow position="bottom-end">
                        <Menu.Target>
                            {showButtonLabels ? <Button variant="light" rightSection={<IconPlus />}>Créer</Button>
                                : <ActionIcon variant="light" aria-label="Créer"><IconPlus /></ActionIcon>}
                        </Menu.Target>
                        <Menu.Dropdown p="xs" >
                            <Menu.Item
                                leftSection={<IconVote width={20} height={20} />}
                                onClick={openVotingModal}
                            > Un vote </Menu.Item>
                            <Menu.Item
                                leftSection={<IconProposal width={20} height={20} />}
                                onClick={openProposalModal}
                            >Une proposition</Menu.Item>
                            <Menu.Item
                                leftSection={<IconCalendar />}
                                onClick={openMeetingModal}
                            >
                                Une réunion
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Group>
            <Tabs.List >
                <Group justify="space-between">
                    <Group>
                        {
                            tabs.flatMap(tab => tab.wip ? [] : [<Tabs.Tab key={tab.slug} value={tab.slug} onClick={tab.navigate}>
                                <Group>
                                    <Group>{tab.icon} {(showTabLabels || (showActiveTabLabels && props.activeTab === tab.slug)) && <Text>{tab.title}</Text>}</Group>
                                    {tab.unseens > 0 ? <Badge>{tab.unseens}</Badge> : null}
                                </Group>
                            </Tabs.Tab>])
                        }
                    </Group>
                </Group>
            </Tabs.List>
            <Container fluid mt={15}>
                <Tabs.Panel value={props.activeTab}>
                    {props.children}
                </Tabs.Panel>
            </Container>

        </Tabs>
    </ >;
};

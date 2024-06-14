import { ActionIcon, Box, Button, ButtonProps, Group, Menu, Popover, Stack, Text, Textarea, useMantineColorScheme, useMantineTheme } from '@mantine/core'
import { useDisclosure, useHover } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { MainLayout } from '@sloop-vite/MainLayout'
import { ProposalStatusBadge } from '@sloop-vite/component/proposal/StatusBadge'
import { CreateVotingModal } from '@sloop-vite/component/voting/CreateVotingModal'
import { IconProposal } from '@sloop-vite/icon/IconProposal'
import { TrpcOut, trpcReact } from '@sloop-vite/misc/trpc'
import { IconDotsVertical, IconEdit } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import Markdown from 'markdown-to-jsx'
import { useState } from 'react'
import slugify from 'slugify'

export const Route = createFileRoute('/proposal/$id/$slug')({
    component: () => <MainLayout> <ProposalPage /> </MainLayout>
})

function ProposalPage() {
    const { id } = Route.useParams()

    const proposalFetcher = trpcReact.proposal.byId.useQuery({ id })
    const updateProposal = trpcReact.proposal.update.useMutation({
        onSuccess: () => {
            proposalFetcher.refetch()
        }
    })

    const proposal = proposalFetcher.data

    const { hovered, ref } = useHover();

    if (!proposal) return <Text>Loading...</Text>
    return <Stack>
        <Group justify='space-between'>
            <Stack gap='xs'>
                <Group gap='xs' ref={ref}>
                    <IconProposal /><Text>{proposal?.name}</Text>{hovered ? <IconEdit /> : null}
                    <ProposalStatusBadge proposal={proposal} />
                </Group>
            </Stack>
            <Group>
                <PublishButton proposalId={proposal.id} />
                <OtherMenu proposal={proposal} />
            </Group>
        </Group>
        <EditableContent content={proposal.content} onSave={(newContent) => {
            updateProposal.mutate({ proposalId: proposal.id, update: { content: newContent } })
        }} />
    </Stack>
}

function OtherMenu({ proposal }: { proposal: Exclude<TrpcOut['proposal']['byId'], null> }) {
    const archive = trpcReact.proposal.archive.useMutation({
        onSuccess: () => {
            notifications.show({
                title: 'Proposition archivée',
                message: 'La proposition a bien été archivée',
            });
        }
    }).mutate

    const createVotingDisclosure = useDisclosure()
    const [, { open: openCreateVoting }] = createVotingDisclosure

    return <>
        <CreateVotingModal usedDisclosure={createVotingDisclosure} startingValues={{
            proposalId: proposal.id,
            groupId: proposal.groupId,
            description: "",
            name: clampStr("Vote concernant: " + proposal.name, 30),
            slug: slugify(clampStr("Vote concernant: " + proposal.name, 30), { lower: true, strict: true }),
        }} />
        <Menu>
            <Menu.Target>
                <ActionIcon variant='subtle'><IconDotsVertical /></ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                {proposal.publishedAt === null ? <Menu.Item color="red">Supprimer</Menu.Item> : null}
                {proposal.publishedAt ? <Menu.Item onClick={() => archive({
                    proposalId: proposal.id
                })}>
                    Archiver
                </Menu.Item> : null}
                {proposal.archivedAt ? <Menu.Item>Désarchiver</Menu.Item> : null}
                <Menu.Item onClick={openCreateVoting}>
                    Planifier un vote
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    </>
}

function clampStr(str: string, maxLength: number) {
    if (str.length > maxLength) {
        return str.slice(0, maxLength) + '...'
    }
    return str
}

function PublishButton(props: { proposalId: string } & ButtonProps) {
    const { proposalId, ...buttonProps } = props
    const [opened, { close, open }] = useDisclosure()

    const publish = trpcReact.proposal.publish.useMutation({
        onSuccess: () => {
            notifications.show({
                title: 'Proposition publiée',
                message: 'La proposition a bien été publiée',
            });
        }
    }).mutate

    const closeAndPublish = () => {
        close()
        publish({ proposalId })
    }

    return <Popover width={300} position="bottom" withArrow shadow="md" opened={opened} closeOnClickOutside={true}>
        <Popover.Target>
            <Button variant='light' onClick={() => open()} {...buttonProps}>Publier</Button>
        </Popover.Target>
        <Popover.Dropdown>
            <Stack>
                <Text size="xs">Êtes vous sûr de vouloir publié ?</Text>
                <Button onClick={closeAndPublish}>Je suis sur</Button>
                <Text size="xs" c='dimmed'>Vous ne pourrez plus suppimer la proposition (vous pourrez toujours l'archiver), et les membres du groupe seront notifié d'une nouvelle proposition</Text>
            </Stack>
        </Popover.Dropdown>
    </Popover>
}

function EditableContent(props: { onSave: (e: string) => void, content: string }) {
    const { hovered, ref } = useHover();
    const [editing, setEditing] = useState(false)
    const { colorScheme } = useMantineColorScheme();
    const theme = useMantineTheme()

    if (editing) {
        return <Textarea
            autosize
            autoFocus
            defaultValue={props.content}
            onBlur={(e) => {
                setEditing(false)
                props.onSave(e.target.value)
            }}
        />
    }

    const borderColor = colorScheme === 'dark' ? {
        borderColor: hovered ? theme.colors['pirate']?.[5] : theme.colors['pirate']?.[9],
    } : {
        borderColor: hovered ? theme.colors['pirate']?.[5] : theme.colors['pirate']?.[9],
    }

    const style: React.CSSProperties = {
        border: '1px solid',
        borderRadius: 5,
        cursor: 'pointer',
        paddingLeft: 10,
        paddingRight: 10,
        ...borderColor
    }
    const EditIcon = () => <ActionIcon
        style={{ position: 'absolute', top: 0, right: 0 }}
        variant='subtle'
        onClick={() => setEditing(true)}
    >
        <IconEdit />
    </ActionIcon>
    return <Stack>
        <Box style={{ position: 'relative' }}>
            <Box ref={ref} style={style} onClick={() => setEditing(true)}>
                {hovered ? <EditIcon /> : null}
                <Markdown>{props.content}</Markdown>
            </Box >
        </Box >
    </Stack>
}
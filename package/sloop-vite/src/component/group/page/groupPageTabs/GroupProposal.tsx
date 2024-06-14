import { ActionIcon, Alert, Avatar, Chip, Group, Indicator, Menu, ScrollArea, Stack, Table } from "@mantine/core";
import { useDebouncedValue, useDisclosure, useHover } from "@mantine/hooks";
import { CreateProposalModal } from "@sloop-vite/component/proposal/CreateProposalModal";
import { ProposalStatusBadge } from "@sloop-vite/component/proposal/StatusBadge";
import { SloopAvatar } from "@sloop-vite/component/user/Avatar";
import { InlineUser } from "@sloop-vite/component/user/InlineUser";
import { TrpcOut, trpcReact } from "@sloop-vite/misc/trpc";
import { IconChecks, IconDotsVertical, IconPlus } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { Row as TanstackRow, createColumnHelper, flexRender, getCoreRowModel, getExpandedRowModel, getGroupedRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from "react";

type ProposalEntry = TrpcOut['proposal']['list'][number]

export function GroupProposal(props: {
    group: {
        id: string;
        slug: string;
    }
}) {
    const groupFetcher = trpcReact.group.byId.useQuery({ id: props.group.id })
    const group = groupFetcher?.data

    const createDisclosure = useDisclosure()
    const [, { open: openCreateModal }] = createDisclosure
    const unseen = trpcReact.unseen.get.useQuery().data

    const proposalFetcher = trpcReact.proposal.list.useQuery({ groupId: props.group.id })
    const proposals = proposalFetcher.data || []

    const columns = useMemo(() => {
        const columnHelper = createColumnHelper<ProposalEntry>()
        return [
            columnHelper.accessor(row => row.name, {
                id: 'name',
                cell: meta => <Indicator position="top-start" inline disabled={unseen?.unseenProposal.find(x => x.proposalId === meta.row.original.id) === undefined}>{meta.row.original.name}</Indicator>,
                header: () => <>Nom</>,
            }),
            columnHelper.accessor(row => row.authorId, {
                id: 'author',
                cell: meta => <InlineUser userId={meta.row.original.authorId} />,
                header: () => <>Auteur Principal</>,
            }),
            columnHelper.accessor(row => row.authorId, {
                id: 'authors',
                cell: meta => <Avatar.Group>
                    {meta.row.original.coauthors.map(coauthor => <SloopAvatar key={coauthor.id} size="xs" userId={coauthor.id} />)}
                </Avatar.Group>,
                header: () => <>Co-Auteurs</>,
            }),
            columnHelper.display({
                id: 'status',
                cell: meta => <ProposalStatusBadge proposal={meta.row.original} />,
                header: () => <>Status</>,
            }),
            columnHelper.display({
                id: 'actions',
                cell: (cell) => {
                    return <Group justify="right">
                        <Menu key={cell.row.original.id} withArrow position="bottom-end">
                            <Menu.Target>
                                <ActionIcon variant="transparent" onClick={e => e.stopPropagation()}><IconDotsVertical /></ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown p="xs">
                                <Menu.Item leftSection={<IconChecks />}>
                                    Garder comme non-vu
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                },
                header: () => <>
                    <Group justify="right">
                        <ActionIcon onClick={openCreateModal} variant="subtle"><IconPlus /></ActionIcon>
                    </Group>
                </>,
            }),
        ]
    }, [openCreateModal, unseen?.unseenProposal])

    const table = useReactTable<ProposalEntry>({
        columns,
        data: proposals,
        state: {
            // grouping,
            // expanded
        },
        getCoreRowModel: getCoreRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel()
    });

    const [filter, setFilter] = useState('published')

    return <Stack>
        <Alert>
            Si vous faites des propositions avant le XXXX elles seront soumises au vote le XXXX
        </Alert>
        <Group>
            <Chip.Group multiple={false} value={filter} onChange={setFilter}>
                <Chip value='published'>Publiée</Chip>
                <Chip value='mine'>Mes brouillons</Chip>
                <Chip value='all'>Tout</Chip>
            </Chip.Group>
        </Group>
        <CreateProposalModal startingValues={{ groupId: group?.id }} usedDisclosure={createDisclosure} />
        <ScrollArea>
            <Table highlightOnHover>
                <Table.Thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <Table.Tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <Table.Th key={header.id} colSpan={header.colSpan}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </Table.Th>
                            ))}
                        </Table.Tr >
                    ))}
                </Table.Thead>
                <Table.Tbody>
                    {table.getRowModel().rows.map(row => <SloopRow key={row.id} row={row} />)}
                </Table.Tbody>
            </Table>
        </ScrollArea>
    </Stack>
}


const linkToCells = ['name', 'status']

function SloopRow(props: { row: TanstackRow<ProposalEntry> }) {
    const { row } = props
    const navigate = useNavigate()
    const { hovered, ref } = useHover<HTMLTableRowElement>()
    const trpcUtils = trpcReact.useUtils()
    const markAsSeen = trpcReact.unseen.markProposalAsSeen.useMutation({
        onSuccess: () => {
            trpcUtils.unseen.invalidate()
        }
    }).mutate
    const [debouncedHovered] = useDebouncedValue(hovered, 300);

    useEffect(() => {
        if (debouncedHovered) {
            markAsSeen({ proposalId: row.original.id })
        }
    }, [debouncedHovered, markAsSeen, row.original.id, row.original.name])

    return <Table.Tr ref={ref} key={row.id}>
        {row.getVisibleCells().map(cell => {
            const dowe = linkToCells.includes(cell.column.id)
            const onClick = dowe ? () => navigate({
                to: "/proposal/$id/$slug",
                params: row.original
            }) : undefined
            const style = dowe ? { cursor: 'pointer' } : undefined
            return <Table.Td onClick={onClick} key={cell.id} style={style}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </Table.Td>
        })}
    </Table.Tr >
    // <Link to="/proposal/$id/$slug" params={row.original}></Link>
}

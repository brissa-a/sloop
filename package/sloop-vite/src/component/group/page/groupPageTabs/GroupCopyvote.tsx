import { ActionIcon, Alert, Center, Group, Modal, ScrollArea, Stack, Table, Text } from "@mantine/core";

import { useLocalStorage } from "@mantine/hooks";
import { AddCopyAction } from "@sloop-vite/component/group/AddCopyAction";
import { DelCopyAction } from "@sloop-vite/component/group/DelCopyAction";
import { InlineUser } from "@sloop-vite/component/user/InlineUser";
import { useSloop } from "@sloop-vite/hooks/sloop";
import { TrpcOut, trpcReact } from "@sloop-vite/misc/trpc";
import { IconAlertTriangle, IconChevronDown, IconChevronRight, IconMinus, IconPlus, IconSchema } from "@tabler/icons-react";
import { ExpandedState, Row as TanstackRow, createColumnHelper, flexRender, getCoreRowModel, getExpandedRowModel, getGroupedRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { ExploreCopyvote } from "./ExploreCopyvote";


type CopyvoteTableEntry = TrpcOut['group']['byId']['copies'][number]

const empty: CopyvoteTableEntry[] = []

export function GroupCopyvote(props: {
    group: {
        id: string,
        slug: string
    }
}) {
    const groupFetcher = trpcReact.group.byId.useQuery({ id: props.group.id });
    const group = groupFetcher.data;
    const copies = group?.copies || empty
    const { user } = useSloop()

    //put current user on top
    const copiesUserFirst = useMemo(() => {
        const currentUserIndex = copies.findIndex(x => x.copierId === user?.id)
        if (currentUserIndex === -1) return copies
        const copiesCopy = [...copies]
        const currentUser = copiesCopy.splice(currentUserIndex, 1)
        return [...currentUser, ...copiesCopy]
    }, [user, copies])

    const [exploreOpened, setExploreOpened] = useState<string | null>(null)

    const columns = useMemo(() => {
        const columnHelper = createColumnHelper<CopyvoteTableEntry>()
        return [
            columnHelper.accessor(row => row.copierId, {
                header: "Copieur",
                id: 'copierId',
                getGroupingValue: row => row.copierId,
                cell: (cell) => {
                    if (!cell.cell.getIsPlaceholder()) {
                        return <InlineUser userId={cell.getValue()} size='xs' />
                    }
                    return <></>
                },
                aggregationFn: 'unique',
            }),
            columnHelper.accessor(row => row.copiedId, {
                header: "Copié",
                id: 'copiedId',
                aggregationFn: 'count',
                cell: (cell) => {
                    if (cell.cell.getIsAggregated()) {
                        return <Text>{cell.getValue()} utilisateurs</Text>
                    }
                    if (!cell.cell.getIsPlaceholder()) {
                        return <InlineUser userId={cell.getValue()} size='xs' />
                    }
                }
            }),
            columnHelper.accessor(row => row.power, {
                id: 'pouvoir distribué',
                cell: (cell) => <Text>{cell.getValue()}%</Text>,
            }),
            columnHelper.display({
                id: 'actions',
                cell: (cell) => {
                    if (cell.cell.getIsAggregated()) {
                        const addCopyAction = cell.row.original.copierId === user?.id || user?.isAdmin ?
                            <AddCopyAction
                                startingValues={{ groupId: props.group.id }}
                                button={props => <ActionIcon {...props} variant="light"><IconPlus /></ActionIcon>}
                            /> : null
                        const exploreAction = <ActionIcon variant="light" onClick={() => {
                            setExploreOpened(cell.row.original.copierId)
                        }}><IconSchema /></ActionIcon>
                        return <>
                            {[exploreAction, addCopyAction]}
                        </>
                    }
                    const delCopyAction = cell.row.original.copierId === user?.id || user?.isAdmin ?
                        <DelCopyAction
                            params={{ groupId: props.group.id, receiverId: cell.row.original.copiedId }}
                            button={props => <ActionIcon {...props} variant="light"><IconMinus /></ActionIcon>}
                        /> : null
                    return <>{delCopyAction}</>
                },
                header: () => <></>,
            }),
        ]
    }, [props.group.id, user?.id, user?.isAdmin])

    const [expanded, setExpanded] = useState<ExpandedState>(user ? { [`copierId:${user.id}`]: true } : {})
    console.log({ expanded })
    const grouping = useMemo(() => ["copierId"], [])

    const table = useReactTable<CopyvoteTableEntry>({
        columns,
        data: copiesUserFirst,
        state: {
            grouping,
            expanded
        },
        onExpandedChange: setExpanded,
        getCoreRowModel: getCoreRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel()
    });

    const [showWarning, setShowWarning] = useLocalStorage({
        key: 'copyvote-warning2',
        defaultValue: true
    })

    if (!group) return groupFetcher.isFetching ? <Center>Chargement...</Center> : <Center>Erreur</Center>

    return <Stack>
        {
            showWarning && <Alert variant="light" color="yellow" withCloseButton icon={<IconAlertTriangle />} onClose={() => setShowWarning(false)}>
                Attention les modifications faites ici n'impactes <Text fw={900} span>pas</Text> les votes déja en cours, allez directement sur le vote pour pouvoir modifier qui vous copiez
            </Alert>
        }
        <Modal size="80vw" opened={!!exploreOpened} onClose={() => {
            setExploreOpened(null)
        }} title="Explorer les copivotes">
            <ExploreCopyvote initialUserId={exploreOpened || "idc"} groupId={props.group.id} />
        </Modal>
        <ScrollArea>
            <Table highlightOnHover>
                <Table.Thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <Table.Tr key={headerGroup.id}>
                            <Table.Th></Table.Th>
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
                    {table.getRowModel().rows.map(row => <SloopRow key={row.id} row={row} usedExpanded={[expanded, setExpanded]} />)}
                </Table.Tbody>
            </Table>
        </ScrollArea>
    </Stack>
}

function SloopRow(props: { row: TanstackRow<CopyvoteTableEntry>, usedExpanded: [ExpandedState, React.Dispatch<React.SetStateAction<ExpandedState>>] }) {
    const { row } = props
    const [, setExpanded] = props.usedExpanded
    const expand = () => {
        if (row.getIsGrouped()) {
            setExpanded({
                [row.id]: !row.getIsExpanded()
            })
        }
    }
    return <Table.Tr key={row.id} style={{ cursor: "pointer" }}>
        <Table.Td onClick={expand}>
            {row.getIsGrouped() ? <ActionIcon variant="transparent">{row.getIsExpanded() ? <IconChevronDown /> : <IconChevronRight />}</ActionIcon> : null}
        </Table.Td>
        {row.getVisibleCells().map(cell => {
            return <Table.Td key={cell.id} onClick={cell.column.id != 'actions' ? expand : () => { }}>
                <Group>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Group>
                {/* <Text>{cell.getIsPlaceholder() ? "placeholder" : "not placeholder"}</Text>
                <Text>{cell.getIsGrouped() ? "grouped" : "not grouped"}</Text>
                <Text>{cell.getIsAggregated() ? "aggregated" : "not aggregated"}</Text> */}
            </Table.Td>
        })}
    </Table.Tr >
}


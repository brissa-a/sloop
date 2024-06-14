import { ActionIcon, Badge, Button, Checkbox, Group, Menu, ScrollArea, Stack, Table, Text } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { isBetweenStartAndExpiration, membershipsByUser } from "@sloop-express/misc/membership";
import { InlineUser } from "@sloop-vite/component/user/InlineUser";
import { AddMembershipAction } from "@sloop-vite/component/user/membership/AddMembershipAction";
import { humanFriendlyDate, humanFriendlyTime } from "@sloop-vite/misc/date";
import { privilegeColor } from "@sloop-vite/misc/privilege-color";
import { TrpcOut, trpcReact } from "@sloop-vite/misc/trpc";
import { IconBan, IconChevronDown, IconChevronRight, IconDotsVertical, IconInfinity, IconPlus } from "@tabler/icons-react";
import { ExpandedState, Row as TanstackRow, createColumnHelper, flexRender, getCoreRowModel, getExpandedRowModel, getGroupedRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo, useState } from "react";


const roleToFrench: Record<string, JSX.Element> = {
    'CAPTAIN': <Badge m={2} color={privilegeColor.captain}>Capitaine</Badge>,
    'MEMBER': <Badge m={2} color={privilegeColor.member}>Membre</Badge>,
}


export function GroupMemberships(props: {
    group: {
        id: string;
        slug: string;

    }
}) {
    const groupFetcher = trpcReact.group.byId.useQuery({ id: props.group.id })
    const group = groupFetcher?.data

    const [showOlderMemberships, setShowOlderMemberships] = useLocalStorage({
        key: `showOlderMemberships-${props.group.id}`,
        defaultValue: false
    })

    const membersAndMembership = useMemo(() => {
        const memberships = group?.memberships || []
        const membershipToShow = showOlderMemberships ? memberships : memberships.filter(isBetweenStartAndExpiration)
        return membershipsByUser(membershipToShow).map(([userId, memberships]) => ({ userId, memberships }))
    }, [group, showOlderMemberships])

    const maybeLoadedMembers = trpcReact.useQueries(t => {
        return membersAndMembership.map(({ userId, }) => {
            return t.user.byId({ id: userId })
        })
    })

    const revoke = trpcReact.user.membership.revoke.useMutation({
        onSuccess: () => {
            groupFetcher.refetch()
            notifications.show({
                title: "Adhésion révoquée",
                message: "",
            })
        }
    }).mutateAsync

    const memberships = useMemo(
        () => buildMembershipsEntries(maybeLoadedMembers, props.group.id),
        [membersAndMembership, props.group.id]//Whatever linter says, this is correct. There is a bug with useQueries maybeLoadedMembers is always a new array so it create a render loop
    )

    const columns = useMemo(() => {
        const columnHelper = createColumnHelper<MembershipTableEntry>()
        return [
            {
                header: "Utilisateur",
                columns: [
                    columnHelper.accessor(row => row.user.slug, {
                        id: 'user',
                        getGroupingValue: row => row.user.id,
                        cell: cell => {
                            if (!cell.cell.getIsPlaceholder()) {
                                return <InlineUser userId={cell.row.original.user.id} />
                            }
                        },
                        aggregationFn: 'unique',
                        header: () => <></>,
                    }),
                ]
            },
            {
                header: "Adhésion",
                columns: [
                    columnHelper.accessor(row => row.membership.role, {
                        id: 'role',
                        cell: cell => {
                            if (cell.cell.getIsAggregated()) {
                                const value = cell.getValue() as unknown as string[]
                                return <Text>{value.map(x => roleToFrench[x])}</Text>
                            }
                            return <>
                                <Text>{roleToFrench[cell.getValue()]}</Text>
                            </>
                        },
                        aggregationFn: (_columnId, leafRows,) => {
                            const values = leafRows.filter(row => isBetweenStartAndExpiration(row.original.membership)).map(row => row.original.membership.role)
                            const uniqueValues = Array.from(new Set(values.flat()))
                            return uniqueValues
                        },
                        aggregatedCell: cell => {
                            return <Text>{cell.getValue()}aaa</Text>
                        },
                        header: () => <>Role</>,
                    }),
                    columnHelper.accessor(row => row.membership.startDate, {
                        id: 'start',
                        cell: cell => {
                            const date = humanFriendlyDate(cell.getValue())
                            const time = humanFriendlyTime(cell.getValue())
                            return <Text>{date} {time}</Text>
                        },
                        aggregationFn: 'min',
                        header: () => <>Depuis le</>,
                    }),
                    columnHelper.accessor(row => row.membership.expirationDate, {
                        id: 'expiration',
                        aggregationFn: (_columnId, leafRows,) => {
                            const keepMax = (a: Date | null, b: Date | null) => {
                                if (!a) return a
                                if (!b) return b
                                return a > b ? a : b
                            }
                            return leafRows.reduce((acc, a) => keepMax(acc, a.original.membership.expirationDate), null as Date | null)
                        },
                        cell: cell => {
                            const val = cell.getValue()
                            if (!val) return <IconInfinity stroke={1} />
                            const date = humanFriendlyDate(val)
                            const time = humanFriendlyTime(val)
                            return <Text>{date} {time}</Text>
                        },
                        header: () => <>Expire le</>,
                    }),
                ]
            },
            {
                id: "actions",
                columns: [
                    columnHelper.display({
                        id: 'actions',
                        cell: (cell) => {
                            if (cell.cell.getIsAggregated()) {
                                return <Menu key={cell.row.original.membership.id} withArrow position="bottom-end">
                                    <Menu.Target>
                                        <ActionIcon variant="transparent" onClick={e => e.stopPropagation()}><IconDotsVertical /></ActionIcon>
                                    </Menu.Target>
                                    <Menu.Dropdown p="xs">
                                        <Group justify="space-between">
                                            <Menu.Label>Section:</Menu.Label>
                                            <Group gap={1}>
                                                <Badge color={privilegeColor.captain} variant="light" size="xs">Capitaine</Badge>
                                                <Badge color={privilegeColor.admin} variant="light" size="xs">Admin</Badge>
                                            </Group>
                                        </Group>
                                        <Menu.Item leftSection={<IconPlus />}>Ajouter une nouvelle adhésion</Menu.Item>
                                        <Menu.Divider />
                                        <Menu.Item color="red" leftSection={<IconBan />}>Révoquer toutes les adhésions</Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            }
                            return <Menu key={cell.row.original.membership.id} withArrow position="bottom-end">
                                <Menu.Target>
                                    <ActionIcon variant="transparent" onClick={e => e.stopPropagation()}><IconDotsVertical /></ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown p="xs">
                                    <Menu.Label>Capitaine uniquement</Menu.Label>
                                    <Menu.Item color="red" leftSection={<IconBan />} onClick={() => revoke({ membershipId: cell.row.original.membership.id })}>Révoquer l'adhésions</Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        },
                        header: () => <></>,
                    }),
                ]
            }
        ]
    }, [])

    const [expanded, setExpanded] = useState<ExpandedState>({})

    const grouping = useMemo(() => ["user"], [])

    const table = useReactTable<MembershipTableEntry>({
        columns,
        data: memberships,
        state: {
            grouping,
            expanded
        },
        onExpandedChange: setExpanded,
        getCoreRowModel: getCoreRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel()
    });

    return <Stack>
        <Group justify="right">
            <AddMembershipAction button={(props) => <Button {...props}>Ajouter une adhesion</Button>} startingValues={{ groupId: group?.id, startDate: new Date(), role: "MEMBER" }} />
            <Checkbox checked={showOlderMemberships} onChange={() => {
                setShowOlderMemberships(!showOlderMemberships)
            }} labelPosition="left" variant="outline" label="Afficher les anciens membres" />
        </Group>
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
                    {table.getRowModel().rows.map(row => <SloopRow key={row.id} row={row} />)}
                </Table.Tbody>
            </Table>
        </ScrollArea>
    </Stack>
}

type MembershipTableEntry = ReturnType<typeof buildMembershipsEntries>[number]

function buildMembershipsEntries(maybeLoadedMembers: { data: TrpcOut['user']['byId'] | undefined }[], groupId: string) {
    const members = maybeLoadedMembers.flatMap(x => x.data ? [x.data] : []);
    return members.flatMap(({ groupMembership, ...remain }) => {
        const currentGroupMembership = groupMembership.filter(x => x.groupId === groupId);
        return currentGroupMembership.map(membership => ({ user: remain, membership }));
    });
}

function SloopRow(props: { row: TanstackRow<MembershipTableEntry> }) {
    const { row } = props
    return <Table.Tr key={row.id} style={{ cursor: "pointer" }}>
        <Table.Td onClick={row.getToggleExpandedHandler()}>
            {row.getIsGrouped() ? <ActionIcon variant="transparent">{row.getIsExpanded() ? <IconChevronDown /> : <IconChevronRight />}</ActionIcon> : null}
        </Table.Td>
        {row.getVisibleCells().map(cell => {
            return <Table.Td key={cell.id} onClick={cell.column.id != 'actions' ? row.getToggleExpandedHandler() : () => { }}>
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

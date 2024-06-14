import { ActionIcon, Box, Button, Center, Group, ScrollArea, Space, Stack, Tabs, Text, UnstyledButton } from "@mantine/core";
import { SloopAvatar } from "@sloop-vite/component/user/Avatar";
import { InlineUser } from "@sloop-vite/component/user/InlineUser";
import { trpcReact } from "@sloop-vite/misc/trpc";
import { IconCaretLeft, IconCaretRight, IconChevronDown, IconChevronRight, IconRepeat } from "@tabler/icons-react";
import ms from "ms";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type FlamegraphData = {
    name: string;
    value: number;
    children?: FlamegraphData[];
    tooltip?: string;
    backgroundColor?: string;
    color?: string;
};

//Not much maintained library
//TODO replace with a better one
import { Copy } from "@sloop-vite/misc/graph";
import { FlameGraph } from 'react-flame-graph';

export const ExploreCopyvote = (props: { initialUserId: string; groupId: string; }) => {
    return <Tabs defaultValue="browse">
        <Tabs.List>
            <Tabs.Tab value="browse">
                Parcourir
            </Tabs.Tab>
            <Tabs.Tab value="flamegraph">
                Flamegraph
            </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="browse">
            <BrowseTab {...props} />
        </Tabs.Panel>

        <Tabs.Panel value="flamegraph">
            <FlamegraphTab {...props} />
        </Tabs.Panel>
    </Tabs>
}

export const FlamegraphTab = (props: { initialUserId: string; groupId: string; }) => {
    const { groupId, initialUserId } = props;
    const groupFetcher = trpcReact.group.byId.useQuery({ id: groupId });
    const group = groupFetcher.data;

    if (!group) return groupFetcher.isLoading ? <Text>Loading...</Text> : <Text>Group not found</Text>;

    // const testData: FlamegraphData = {
    //     name: 'root',
    //     value: 5,
    //     children: [
    //         {
    //             name: 'custom tooltip',
    //             value: 1,

    //             // Each node can specify a "tooltip" to be shown on hover.
    //             // By default, the node's "name" will be used for this.
    //             tooltip: 'Custom tooltip shown on hover',
    //         },
    //         {
    //             name: 'custom colors',

    //             // Each node can also provide a custom "backgroundColor" or text "color".
    //             backgroundColor: '#35f',
    //             color: '#fff',

    //             value: 3,
    //             children: [
    //                 {
    //                     name: 'leaf',
    //                     value: 2
    //                 }
    //             ]
    //         },
    //     ],
    // };

    //To heavy to compute
    //const paths = allSimplePaths(graph, initialUserId, "fake-user-id-49");
    //console.log({ paths });
    const stack: Copy[] = []
    const data = {
        name: initialUserId,
        value: 100,
        children: browseCopies(group.copies, initialUserId, (current, next) => {
            // console.log("processing", stack.map(x => x.copierId))
            if (stack.find(x => x.copiedId === current.copiedId)) {
                // console.log("loop detected", current.copiedId, stack.map(x => x.copierId));
                return [{
                    name: current.copiedId + " loop detected",
                    value: 0.001,
                    backgroundColor: 'red'
                }];
            }
            stack.push(current);
            const value = stack.reduce((acc, x) => acc * x.power / 100, 100);
            if (value < 0.001) {
                stack.pop();
                // console.log("value too low", value, current.copierId, stack.map(x => x.copierId))
                return [{
                    name: current.copiedId + " value too low",
                    value: 0.001,
                    backgroundColor: 'red',
                }];
            }
            const children = next();
            stack.pop();
            return [{
                name: current.copiedId + " " + value + "%",
                value,
                tooltip: current.copiedId + " " + value + "%",
                children,
            }];
        })
    }

    return <FlameGraph
        data={data}
        height={800}
        width={800}
        onChange={(node: { name: string }) => {
            console.log(`"${node.name}" focused`);
        }}
    />
}

function browseCopies(
    copies: Copy[],
    initialUserId: string,
    callback: (current: Copy, next: () => FlamegraphData[]) => [] | [FlamegraphData]
): FlamegraphData[] {
    const outbounds = copies.filter(x => x.copierId === initialUserId);
    if (outbounds.length === 0) return [];
    return outbounds.flatMap(
        outbound => callback(outbound, () => recurseCopies(copies, outbound, callback))
    );
}

function recurseCopies<FlamegraphData>(
    copies: Copy[],
    last: Copy,
    callback: (current: Copy, next: () => FlamegraphData[]) => [] | [FlamegraphData]
): FlamegraphData[] {
    const outbounds = copies.filter(x => x.copierId === last.copiedId);
    if (outbounds.length === 0) return [];
    return outbounds.flatMap(
        outbound => callback(outbound, () => recurseCopies(copies, outbound, callback))
    );
}

export const BrowseTab = (props: { initialUserId: string; groupId: string; }) => {
    const { groupId, initialUserId } = props;
    // const user = trpcReact.user.byId.useQuery({ id: userId }, { staleTime: ms('5m') }).data;
    const groupFetcher = trpcReact.group.byId.useQuery({ id: groupId });
    const group = groupFetcher.data;

    const [copiedStack, setCopiedStack] = useState<Copy[]>([]);
    const [currentCopiedUserId, setCurrentCopiedUserId] = useState<string | null>(initialUserId);
    const viewportCopied = useRef<HTMLDivElement>(null);

    const [copierStack, setCopierStack] = useState<Copy[]>([]);
    const [currentCopierUserId, setCurrentCopierUserId] = useState<string | null>(initialUserId);
    const viewportCopier = useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //     if (viewportCopied.current) {
    //         viewportCopied.current.scrollLeft = viewportCopied.current.scrollWidth;
    //     }
    // }, [copiedStack]);

    useEffect(() => {
        if (viewportCopier.current) {
            viewportCopier.current.scrollLeft = viewportCopier.current.scrollWidth;
        }
    }, [copierStack]);

    if (!group) return groupFetcher.isLoading ? <></> : <Text>Group not found</Text>;

    return <Stack mt={12}>
        <Center><InlineUser userId={initialUserId} /></Center>
        <Space h={30}></Space>
        <Group align='flex-start' justify="space-evenly">
            <Stack w={420}>
                <Stack justify="space-between">
                    <Button onClick={() => {
                        //pop copied stack
                        if (copiedStack.length > 2) {
                            setCurrentCopiedUserId(copiedStack[copiedStack.length - 2]!.copierId);
                            setCopiedStack(copiedStack.slice(0, -1));
                        } else {
                            setCurrentCopiedUserId(initialUserId);
                            setCopiedStack([]);
                        }
                    }
                    }>Retour</Button>
                    <ScrollArea offsetScrollbars={true} type='auto' viewportRef={viewportCopied}>
                        <Group wrap="nowrap" gap='xs'>
                            &nbsp;{copierStack.reduce((acc, x) => acc * x.power / 100, 100)}%=
                            {[...copiedStack].reverse().map(({ copiedId, copierId, power }) => {
                                return <>
                                    <SloopAvatar key={`${copierId}-${copiedId}`} userId={copierId} size='xs' />
                                    &lt;
                                    <Text>{power}%</Text>
                                </>
                            })}
                            <SloopAvatar userId={initialUserId} size='xs' />
                        </Group>
                    </ScrollArea>
                    {/* {copiedStack[copiedStack.length - 1] && <Group> <InlineUser userId={initialUserId} /> est copié indirectment par <InlineUser userId={copiedStack[copiedStack.length - 1]!.copierId} /> a {copiedStack.reduce((acc, x) => acc * x.power / 100, 100)} %</Group>} */}
                    <Text>Est copié: ({group.copies.filter(x => currentCopiedUserId === x.copiedId).length})</Text>

                </Stack>
                <Stack gap={'xs'}>
                    {group.copies.filter(x => currentCopiedUserId === x.copiedId).map(
                        d => <UnstyledButton onClick={() => {
                            setCurrentCopiedUserId(d.copierId)
                            setCopiedStack([...copiedStack, d]);
                        }}>
                            <Group>
                                <IconCaretLeft size={20} />
                                <Text>{d.power}%</Text>
                                <InlineUser userId={d.copierId} />
                                {copierStack.find(x => x.copiedId === d.copiedId) && <IconRepeat />}
                            </Group>
                        </UnstyledButton>
                    )}
                </Stack>
            </Stack>
            <Stack w={420}>
                <Stack justify="space-between">
                    <Button onClick={() => {
                        //pop copied stack
                        if (copierStack.length < 2) {
                            setCurrentCopierUserId(initialUserId);
                            setCopierStack([]);
                        }
                        setCurrentCopierUserId(copierStack[copierStack.length - 2]!.copiedId);
                        setCopierStack(copierStack.slice(0, -1));
                    }
                    }>Retour</Button>
                    <Stack>
                        <ScrollArea offsetScrollbars={true} type='auto' viewportRef={viewportCopier}>
                            <Group wrap="nowrap" gap='xs'>
                                <SloopAvatar userId={initialUserId} size='xs' />
                                {copierStack.map(({ copiedId, copierId, power }) => {
                                    return <>
                                        <Text>{power}%</Text>&gt;
                                        <SloopAvatar key={`${copierId}-${copiedId}`} userId={copiedId} size='xs' />
                                    </>;
                                })}
                                =&nbsp;{copierStack.reduce((acc, x) => acc * x.power / 100, 100)}%
                            </Group>
                        </ScrollArea>
                        {/* {copierStack[copierStack.length - 1] && <Group> <InlineUser userId={initialUserId} /> copie indirectment <InlineUser userId={copierStack[copierStack.length - 1]!.copiedId} /> a {copierStack.reduce((acc, x) => acc * x.power / 100, 100)} %</Group>} */}
                    </Stack>
                    <Text>copie: ({group.copies.filter(x => currentCopierUserId === x.copierId).length})</Text>
                </Stack>
                <Stack gap={'xs'} align="end">
                    {group.copies.filter(x => currentCopierUserId === x.copierId).map(
                        d => <UnstyledButton onClick={() => {
                            setCurrentCopierUserId(d.copiedId)
                            setCopierStack([...copierStack, d]);
                        }}>
                            <Group>
                                {copierStack.find(x => x.copiedId === d.copiedId) && <IconRepeat />}
                                <InlineUser userId={d.copiedId} />
                                <Text>{d.power}%</Text>
                                <IconCaretRight size={20} />
                            </Group>
                        </UnstyledButton>
                    )}
                </Stack>
            </Stack>
        </Group >
    </Stack >;
};



export const Downfall = (props: {
    copyStack: [Copy, ...Copy[]];
    groupId: string;
    direction: 'copier' | 'copied';
}) => {
    const { groupId, copyStack } = props;
    const [headCopy] = copyStack;
    const idStack = copyStack.map(({ copiedId, copierId }) => props.direction === 'copier' ? copiedId : copierId);
    const { power, copierId, copiedId } = headCopy;
    const copied = trpcReact.user.byId.useQuery({ id: copiedId }, { staleTime: ms('5m') }).data;
    const copier = trpcReact.user.byId.useQuery({ id: copierId }, { staleTime: ms('5m') }).data;
    const [showNext, setShowNext] = useState(false);
    const downstreamUser = props.direction === 'copier' ? copier : copied;
    const upstreamUser = props.direction === 'copier' ? copied : copier;

    const downstreamUserCopier = useCallback((x: { copiedId: string; }) => x.copiedId === downstreamUser?.id, [downstreamUser?.id]);
    const downstreamUserCopied = useCallback((x: { copierId: string; }) => x.copierId === downstreamUser?.id, [downstreamUser?.id]);

    const group = trpcReact.group.byId.useQuery({ id: groupId }).data;
    console.log({ headCopy, copyStack });
    const next = useMemo(() => {
        if (!showNext) return null;
        if (!downstreamUser) return <></>; //TODO handle loading
        if (!group) return <></>; //TODO handle loading
        const downstreamFilter = props.direction === 'copier' ? downstreamUserCopier : downstreamUserCopied;
        const nextCopy = group.copies.filter(downstreamFilter);
        if (!nextCopy || nextCopy.length < 1) return <>No more receiver</>;

        return <>
            {nextCopy?.map(
                nextCopy => <Downfall key={`${nextCopy.copierId}-${nextCopy.copiedId}`} copyStack={[nextCopy, ...props.copyStack]} groupId={groupId} direction={props.direction} />
            )}
        </>;
    }, [showNext, downstreamUser, group, props.direction, props.copyStack, downstreamUserCopier, downstreamUserCopied, groupId]);

    if (!downstreamUser || !upstreamUser) return <></>; //TODO handle loading

    return <Box>
        <Group justify="space-between">
            <ActionIcon size='compact-md' variant='subtle' onClick={() => setShowNext(!showNext)}>{showNext ? <IconChevronDown size={20} /> : <IconChevronRight size={20} />}</ActionIcon>
            a {power}%  {props.direction === 'copier' ? 'par' : null} <InlineUser userId={downstreamUser.id} />  {idStack.includes(downstreamUser.id) && <IconRepeat />}

            {showNext && <Text span c='dimmed' size='xs'>qui lui même {props.direction === 'copied' ? "copie" : "est copié"} ...</Text>}
        </Group>
        {showNext && next}
    </Box>;
};

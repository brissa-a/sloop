import { Box, ScrollArea } from '@mantine/core';
import React, { useState, useEffect, useRef } from 'react';

export type ScrollDirection = 'top' | 'bottom';

export const InfiniteScrollComponent = <T extends { key: string }>({ initialItems, itemHeight, fetchMore, children }: {
    initialItems?: T[],
    fetchMore: (direction: ScrollDirection) => T[],
    itemHeight: number,
    children: (item: T) => JSX.Element;
}) => {
    const [items, setItems] = useState<T[]>(initialItems || []);
    const [loading, setLoading] = useState(false);
    const outterRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    //innerRef set to window
    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                console.log('Resized to', entry.contentRect, outterRef.current && outterRef.current.scrollTop);
            }
        });
        if (innerRef.current) resizeObserver.observe(innerRef.current);
        return () => {
            if (innerRef.current) resizeObserver.unobserve(innerRef.current);
        };
    }, []);
    // Mock function to simulate fetching data
    const fetchData = (direction: ScrollDirection) => {
        setLoading(true);
        setTimeout(() => {
            const newItems = fetchMore(direction);
            setItems(() => {
                return direction === 'top' ? [...newItems, ...items] : [...items, ...newItems];
            });
            if (outterRef.current && direction === 'top') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                // if ((window as any).safari) {
                //     outterRef.current.scrollTop = newItems.length * itemHeight;
                // }
            }
            setLoading(false);
        }, 500);
    };

    const handleScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
        console.log(scrollTop, clientHeight, scrollHeight);
        if (scrollTop < 100 && !loading) {
            fetchData('top');
        }
        if (scrollHeight - (scrollTop + clientHeight + 100) < 0 && !loading) {
            fetchData('bottom');
        }
    };

    return (
        <ScrollArea h={600} ref={outterRef} onScroll={handleScroll} style={{ overflowY: 'auto' }}>
            <Box ref={innerRef}>
                {items.map((item) => (
                    <Box p={0} m={0} h={itemHeight} key={item.key}>
                        {children(item)}
                    </Box>
                ))}
            </Box>
        </ScrollArea >
    );
};


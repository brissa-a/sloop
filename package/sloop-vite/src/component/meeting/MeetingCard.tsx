import { Box, Button, Container, Group, Indicator, Paper, Space, Text } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { trpcReact } from '@sloop-vite/misc/trpc';
import { IconCalendarEvent } from '@tabler/icons-react';
import { Link, useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useCallback } from 'react';
import { TimeUnit, humanFriendlyFromTo } from '../../misc/date';
export const unitToFrench: Record<TimeUnit, string> = {
    day: 'j',
    week: 'sem',
    month: 'm',
    year: 'a'
};

export const MeetingCard = ({ meetingId, split }: {
    meetingId: string, split?: {
        startDate: dayjs.Dayjs,
        endDate: dayjs.Dayjs,
        current: number,
        max: number,
        timeUnit: TimeUnit
    }
}) => {
    const { hovered, ref } = useHover();
    const navigate = useNavigate();

    const now = dayjs(new Date());
    const meeting = trpcReact.meeting.byId.useQuery({ id: meetingId }).data;
    const gotoMeeting = useCallback(() => meeting && navigate({ to: "/meeting/$id/$slug", params: meeting, resetScroll: true }), [meeting, navigate]);
    if (!meeting) return <Paper w={420} py={10} h={112} opacity={1} shadow={'xs'} />;//TODO: loading
    const { title, scheduledStartAt, scheduledEndAt, group } = meeting
    const groupSlug = group?.slug
    const dateStart = dayjs(scheduledStartAt);
    const dateEnd = dayjs(scheduledEndAt);
    const processing = (split ? split.startDate : dateStart).isBefore(now) && (split ? split.endDate : dateEnd).isAfter(now);
    const passed = (split ? split.endDate : dateEnd).isBefore(now);
    const opacity = passed ? 0.5 : 1;
    const className = hovered ? 'hoverable hovered' : 'hoverable';
    const splitDisplay = split && split.max > 1 ? <Text span size='sm' fs='italic'> {unitToFrench[split.timeUnit]}{split.current + 1}/{split.max} </Text> : null;


    return (<Paper w={420} py={10} h={120} opacity={opacity} shadow={hovered ? 'md' : 'xs'} className={className}
        onClick={gotoMeeting} style={{ cursor: 'pointer' }} ref={ref}>
        <Indicator processing disabled={!processing}>
            <Container fluid>
                <Group wrap='nowrap' h='3rem' gap={'xs'}  >
                    <Box h={18}><IconCalendarEvent size={18} /></Box>
                    <Text lineClamp={2} fw={400}>{splitDisplay}{title}</Text>
                </Group>
                <Space h={10} />
                <Group gap={0} wrap='nowrap' justify='space-between'>
                    <Text span size='sm'>{humanFriendlyFromTo(dateStart.toDate(), dateEnd.toDate())}</Text>
                    <Button
                        renderRoot={(props) => {
                            return <Link to={'/group/$slug'} params={{ slug: groupSlug }} {...props} />
                        }}
                        onClick={e => e.stopPropagation()}
                        opacity={0.50} variant="transparent" size="compact-xs" ml={10}>#{groupSlug}</Button>
                </Group>
            </Container>
        </Indicator>
    </Paper >);
};

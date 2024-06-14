import { Box, Button, Container, Group, Indicator, Paper, Space, Text } from "@mantine/core";
import { humanFriendlyFromTo } from "@sloop-vite/misc/date";
import { TrpcOut } from "@sloop-vite/misc/trpc";
import { IconCalendarEvent } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";

type HoverCardProps = { meeting: Exclude<TrpcOut['meeting']['byId'], null> };

export const MeetingHoverCard = ({ meeting }: HoverCardProps) => {
    const now = dayjs(new Date());
    if (!meeting) return <Paper w={420} py={10} h={112} opacity={1} shadow={'xs'} />;//TODO: loading
    const { title, scheduledStartAt, scheduledEndAt, group } = meeting
    const groupSlug = group?.slug
    const dateStart = dayjs(scheduledStartAt);
    const dateEnd = dayjs(scheduledEndAt);
    const processing = dateStart.isBefore(now) && dateEnd.isAfter(now);

    return <Indicator processing disabled={!processing}>
        <Container fluid>
            <Group wrap='nowrap' h='3rem' gap={'xs'}  >
                <Box h={18}><IconCalendarEvent size={18} /></Box>
                <Text lineClamp={2} fw={400}>{title}</Text>
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
}


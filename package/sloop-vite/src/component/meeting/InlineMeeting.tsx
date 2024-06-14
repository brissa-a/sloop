import { Group, HoverCard, Text, useMantineColorScheme } from "@mantine/core";
import { trpcReact } from "@sloop-vite/misc/trpc";
import { IconCalendarEvent } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { MeetingHoverCard } from "./MeetingHoverCard";

export const InlineMeeting = ({ meetingId }: { meetingId: string }) => {
    const meeting = trpcReact.meeting.byId.useQuery({ id: meetingId }).data;
    const { colorScheme } = useMantineColorScheme();
    if (!meeting) return null

    return <HoverCard position="bottom" withArrow shadow="md" openDelay={200} closeDelay={100}>
        <HoverCard.Target>
            <Group gap={0}>
                <IconCalendarEvent size="15" />
                <Text c={colorScheme === 'dark' ? 'pirate.3' : 'pirate.6'}
                    lineClamp={1}
                    onClick={() => close()}
                    renderRoot={(props) => {
                        return <Link to='/meeting/$id/$slug' params={meeting} {...props} />
                    }}
                >{meeting.slug}</Text>
            </Group>
        </HoverCard.Target>
        <HoverCard.Dropdown w={400} >
            <MeetingHoverCard meeting={meeting} />
        </HoverCard.Dropdown>
    </HoverCard >;
};

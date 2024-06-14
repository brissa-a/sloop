import { Box, ScrollArea, Space, Text } from "@mantine/core";
import { TrpcOut } from "@sloop-vite/misc/trpc";
import _ from 'lodash';
import { useEffect, useMemo, useRef, useState } from "react";
import { TimeUnit } from "../misc/date";
import dayjs from '../misc/dayjs';
import { buildSplits } from "../misc/meeting";
import { MeetingCard } from "./meeting/MeetingCard";
import { DateDivider, NowDivider } from "./meeting/planning/Dividers";


export const Planning = (
    {
        meetings,
        splitBy,
        showEmpty
    }: { meetings: TrpcOut['meeting']['getAll'], splitBy: TimeUnit, showEmpty: boolean }
) => {
    const viewport = useRef<HTMLDivElement>(null);
    const [todayRef, setTodayRef] = useState<React.RefObject<HTMLDivElement>>({ current: null });
    useEffect(() => {
        console.log("try scrolling to today")
        if (viewport.current && todayRef.current) {
            console.log("scrolling to today")
            viewport.current.scrollTo({
                top: todayRef.current.offsetTop - 85,
                behavior: 'auto'
            });
        }
    }, [viewport.current, todayRef.current]);//Whatever linter says, this is correct

    const all = useMemo(() => buildMeetingList(meetings, splitBy, setTodayRef, showEmpty), [meetings, splitBy, showEmpty]);
    console.log("Rerender")
    return <ScrollArea h={600} w={420 + 15} viewportRef={viewport}>
        {all}
    </ScrollArea>;
};



function buildMeetingList(meetings: TrpcOut['meeting']['getAll'], splitBy: TimeUnit, setTodayRef: React.Dispatch<React.SetStateAction<React.RefObject<HTMLDivElement>>>, showEmpty: boolean) {
    console.log({ meetings, splitBy, showEmpty }, "buildMeetingList")
    const splits = meetings
        .flatMap(m => buildSplits({ ...m, startDate: m.scheduledStartAt, endDate: m.scheduledEndAt }, splitBy))
        .sort(sortByStartDateAndEndDate)
        .map((split) => ({ key: split.meeting.id + '-' + split.index, ...split }));
    const now = dayjs(new Date()).startOf(splitBy != 'week' ? splitBy : 'isoWeek');
    const lastSplit = splits[splits.length - 1];
    const split = splits[splits.length - 1];
    const maxDate = split ? lastSplit ? dayjs(split.start) : now : now;

    const splitsByUnit = _.groupBy(splits, split => dayjs(split.start).startOf(splitBy != 'week' ? splitBy : 'isoWeek').toISOString());
    const all = [];
    const initialSplit = splits[0];
    let currentDate = initialSplit ? dayjs(initialSplit.start).startOf(splitBy != 'week' ? splitBy : 'isoWeek') : now;
    while (currentDate.isBefore(maxDate)) {
        const key = dayjs(currentDate).toISOString();
        const isNow = now.toISOString() === key;
        const unitCards = splitsByUnit[key]?.map(split => <div key={split.key}>
            <MeetingCard meetingId={split.meeting.id} split={{
                startDate: split.start,
                endDate: split.end,
                current: split.index,
                max: split.splits.length,
                timeUnit: splitBy
            }} />
            <Space h={10} />
        </div>) ?? [];

        //Handle showEmpty option
        if (!showEmpty && unitCards.length === 0 && !isNow /* keep empty now for scroll focus */) {
            currentDate = currentDate.add(1, splitBy);
            continue;
        }

        all.push(<Box
            key={isNow ? ("now" + meetings.length) : currentDate.toISOString()}
            ref={e => {
                isNow && console.log("todays ref set")
                isNow && setTodayRef({ current: e })
            }}
        >
            {isNow
                ? <NowDivider splitBy={splitBy} />
                : <DateDivider splitBy={splitBy} date={currentDate} />}
            {unitCards.length
                ? <Box>{unitCards}</Box>
                : <Text c='dimmed' size="xs">Aucune réunion prévue pour cette date</Text>}
        </Box>);
        currentDate = currentDate.add(1, splitBy);
    }
    return all;
}

export function sortByStartDateAndEndDate(a: ReturnType<typeof buildSplits>[number], b: ReturnType<typeof buildSplits>[number]) {
    if (a.start.isSame(b.start, 'minute')) {
        return a.end.diff(b.end);
    } else {
        return a.start.diff(b.start);
    }
}
import { Divider } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import dayjs from "dayjs";
import { TimeUnit } from "../../../misc/date";
import { unitToLabel, unitToLabelLong, unitToNow } from "./labels";

export const NowDivider = ({ splitBy }: { splitBy: TimeUnit }) => {
    return <Divider color='red' variant="dotted" my="xs" labelPosition="center" label={<>
        <IconChevronDown size='1.2em' />
        {unitToNow[splitBy]}
        <IconChevronDown size='1.2em' />
    </>} />;
};

export const DateDivider = ({ splitBy, date }: { splitBy: TimeUnit, date: dayjs.Dayjs }) => {
    const now = dayjs(new Date()).startOf(splitBy != 'week' ? splitBy : 'isoWeek');
    return <Divider variant="dotted" my="xs" labelPosition="center" label={<>
        <IconChevronDown size='1.2em' />
        {date.year() === now.year() ? unitToLabel[splitBy](date) : unitToLabelLong[splitBy](date)}
        <IconChevronDown size='1.2em' />
    </>} />;
};
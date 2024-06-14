import dayjs from "dayjs";
import { TimeUnit, getMiddleDate } from "./date";

type StartEndDate = { startDate: Date, endDate: Date };

export function sortByMiddleDate<T extends StartEndDate>(a: T, b: T) {
    const aMiddle = getMiddleDate(a.startDate, a.endDate);
    const bMiddle = getMiddleDate(b.startDate, b.endDate);
    return aMiddle.getTime() - bMiddle.getTime();
}

export type Split = ReturnType<typeof buildSplits>[0];

export const buildSplits = <T extends StartEndDate>(meeting: T, splitBy: TimeUnit) => {
    const from = meeting.startDate;
    const to = meeting.endDate;
    const fromSplit = new Date(from);
    const toSplit = new Date(to);

    const splits: {
        start: dayjs.Dayjs,
        end: dayjs.Dayjs,
        index: number,
    }[] = [];
    let i = 0;
    let current = dayjs(fromSplit);
    while (current.isBefore(toSplit)) {
        let next = current.add(1, splitBy).startOf(splitBy != 'week' ? splitBy : 'isoWeek');
        if (next.isAfter(toSplit)) {
            next = dayjs(toSplit);
        }
        splits.push({ start: current, end: next, index: i++ });
        current = next;
    }
    return splits.map(x => ({ ...x, splits, meeting }));
};
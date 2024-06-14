

// const monthNames = ["January", "February", "March", "April", "May", "June",
//   "July", "August", "September", "October", "November", "December"
// ];

import { Group, Stack, Text } from "@mantine/core";

export type TimeUnit = "day" | "week" | "month" | "year";

const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet",
    "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

//const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export function humanFriendlyDate(date: Date) {
    const dayOfWeek = dayNames[date.getDay()];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    if (!day || !month) {

        return `Invalid date: ${date}`;
    }
    const year = date.getFullYear();

    let humanFriendlyDate = `${dayOfWeek}, ${day} ${month.toLowerCase()}`;
    if (year != new Date().getFullYear()) {
        humanFriendlyDate += ` ${year}`;
    }

    return humanFriendlyDate.split(' ').join('\u00A0');
}

export function humanFriendlyTime(date: Date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const humanFriendlyTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return humanFriendlyTime.split(' ').join('\u00A0');
}

export function humanFriendlyFromTo(from: Date, to: Date) {

    if (
        from.getDate() == to.getDate() &&
        from.getMonth() == to.getMonth() &&
        from.getFullYear() == to.getFullYear()
    ) {
        // console.log(from, to);
        return <Stack gap={0} >
            <Text>{humanFriendlyDate(from)}</Text>
            <Text>de {humanFriendlyTime(from)} à {humanFriendlyTime(to)} </Text>
        </Stack>;
    } else {
        return <Stack gap={0}>
            <Group justify="space-between">
                <Text>du {humanFriendlyDate(from)}</Text>
                <Text> {humanFriendlyTime(from)}</Text>
            </Group>
            <Group justify="space-between">
                <Text>au {humanFriendlyDate(to)}</Text>
                <Text> {humanFriendlyTime(to)}</Text>
            </Group>
        </Stack>;
    }
}

export function dateBefore(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();

    return date < now;
}

export function dateAfter(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();

    return date > now;
}

export function getMiddleDate(date1: Date, date2: Date) {
    // Calculate the average timestamp of the two dates
    const timestamp1 = date1.getTime();
    const timestamp2 = date2.getTime();
    const averageTimestamp = (timestamp1 + timestamp2) / 2;

    // Create a new Date object from the average timestamp
    const middleDate = new Date(averageTimestamp);

    return middleDate;
}

export function incDate(date: Date, timeUnit: TimeUnit, inc: number = 1) {
    switch (timeUnit) {
        case "day":
            date.setDate(date.getDate() + inc);
            break;
        case "week":
            date.setDate(date.getDate() + 7 * inc);
            break;
        case "month":
            date.setMonth(date.getMonth() + inc);
            break;
        case "year":
            date.setFullYear(date.getFullYear() + inc);
            break;
    }
    return date;
}
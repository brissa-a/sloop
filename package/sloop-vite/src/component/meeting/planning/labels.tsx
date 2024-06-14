import { _throw } from "@sloop-vite/utils";
import { TimeUnit } from "../../../misc/date";
import dayjs from '../../../misc/dayjs';

export const unitToNow: Record<TimeUnit, string> = {
    day: 'Aujourd\'hui',
    week: 'Cette semaine',
    month: 'Ce mois-ci',
    year: 'Cette année'
};

export const monthToLabel: Record<number, string> = {
    0: 'Janvier',
    1: 'Février',
    2: 'Mars',
    3: 'Avril',
    4: 'Mai',
    5: 'Juin',
    6: 'Juillet',
    7: 'Août',
    8: 'Septembre',
    9: 'Octobre',
    10: 'Novembre',
    11: 'Décembre'
};

export const dayoftheweekToLabel: Record<number, string> = {
    0: 'Dimanche',
    1: 'Lundi',
    2: 'Mardi',
    3: 'Mercredi',
    4: 'Jeudi',
    5: 'Vendredi',
    6: 'Samedi'
};

export const unitToLabel: Record<TimeUnit, (d: dayjs.Dayjs) => string> = {
    day: d => dayoftheweekToLabel[d.day()] + ' ' + d.format('DD') + ' ' + monthToLabel[d.month()],
    week: d => `Semaine ${d.isoWeek()}`,
    month: d => monthToLabel[d.month()] ?? _throw(`Invalid month number ${d.month()}`),
    year: d => d.format('YYYY')
};

export const unitToLabelLong: Record<TimeUnit, (d: dayjs.Dayjs) => string> = {
    day: d => dayoftheweekToLabel[d.day()] + ' ' + d.format('DD') + ' ' + monthToLabel[d.month()] + ' ' + d.format('YYYY'),
    week: d => `Semaine ${d.isoWeek()} de ${d.year()}`,
    month: d => monthToLabel[d.month()] + ' ' + d.format('YYYY'),
    year: d => d.format('YYYY')
};


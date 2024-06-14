import { useEffect, useState } from "react";

type Dhms = { affixe: "in" | "ago", d: number, h: number, m: number, s: number }

export const Timeleft = (props: { until: Date, renderer?: (duration: Dhms) => JSX.Element }) => {
    const recomputeDuration = () => computeDuration({ start: new Date(), end: props.until })
    const [timeLeft, setTimeLeft] = useState(recomputeDuration());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(recomputeDuration());
        }, 1000);

        return () => clearTimeout(timer);
    });

    return props.renderer ? props.renderer(timeLeft) : <>{timeLeft.affixe === "in" ? "in " : null}{timeLeft.d}d {timeLeft.h}h {timeLeft.m}m {timeLeft.s}s{timeLeft.affixe === "ago" ? " ago" : null}</>

}

//I did not use date-fns cause there is no such a function that calculte days without counting month and years
export function computeDuration(duration: { start: Date, end: Date }, affixe: "in" | "ago" = "in"): Dhms {
    const { start, end } = duration;
    const difference = +end - +start;

    if (difference < 0) return computeDuration({ start: end, end: start }, "ago")
    return {
        affixe,
        d: Math.floor(difference / (1000 * 60 * 60 * 24)),
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60)
    }
}

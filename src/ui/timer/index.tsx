import { DateTime } from 'luxon';
import React from 'react'
import Styles from './styles.module.css'

interface Props {
    time : DateTime;
}

export default function Timer ({ time } : Props) {
    const offset = React.useMemo(() => (time.offset - DateTime.now().offset) * 1000 * 60, []);
    const now = time.diffNow().milliseconds;
    const active = now <= time.toMillis();
    
    const [delta, setDelta] = React.useState<number>(time.diffNow().milliseconds);

    React.useEffect(() => {
        if (active) {
            const iter = setInterval(() => {
                const now = time.diffNow().milliseconds;
                setDelta(Math.max(now, 0));
            }, 1000);
            return () => clearInterval(iter)
        }
    }, [active]);

    return <div className={Styles.root}>
        {countdownFormat(delta)}
    </div>
}

function pad (n: number) { return n < 10 ? `0${n}` : `${n}` }

export function countdownFormat(countdown: number) : string {
    // This expects a number representing a duration of time remaining.
    // Returns a string "00:00:00:00"
    if (countdown <= 0) {
        return "00:00:00:00";
    }
    const t = countdown / 1000;
    const d = Math.floor(t / (60 * 60 * 24));
    const h = Math.floor(t % (60 * 60 * 24) / (60 * 60));
    const m = Math.floor(t % (60 * 60) / 60);
    const s = Math.floor(t % (60 * 60) % 60);
    return `${pad(d)}:${pad(h)}:${pad(m)}:${pad(s)}`;
}
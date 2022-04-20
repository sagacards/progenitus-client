import React from 'react'
import hash from 'string-hash'
import Styles from './styles.module.css'

interface Props {
    name    : string;
    size?   : string;
    radius? : string;
}

export default function Hashatar ({
    name,
    size = '100%',
} : Props) {
    const hue = React.useMemo(() => hash(name) % 360, [name]);
    return <div className={Styles.root} style={{width: size, height: size,}}>
        <svg width={size} height={size} viewBox="0 0 100 100">
            <defs>
            <linearGradient x1="0%" y1="0%" x2="100%" y2="100%" id={`g${hue}`}>
                <stop stopColor={`hsl(${hue}deg, 95%, 90%)`} offset="0%"></stop>
                <stop stopColor={`hsl(${hue + 72}deg, 95%, 70%)`} offset="100%"></stop>
            </linearGradient>
            </defs>
            <g id="Page-1" stroke="none" strokeWidth="1" fill="none">
            <rect id="Rectangle" fill={`url(#g${hue})`} x="0" y="0" width="100" height="100"/>
            </g>
        </svg>
    </div>
}

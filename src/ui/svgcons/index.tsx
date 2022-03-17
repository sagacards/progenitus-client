import Styles from './styles.module.css'
import React from 'react'
import { useControls } from 'leva';
import useStore from 'stores/index';

interface Props {
    children?: React.ReactNode;
    thickness?: number;
    width?: number;
    height?: number;
    size?: Size;
};

type Size = 'tiny' | 'small' | 'medium' | 'large';

interface SunProps extends Props {
    rays?: number;   
    body?: number;
    gap?: number;
};

const sizeMap : { [key in Size] : number } = {
    tiny: 16,
    small: 24,
    medium: 38,
    large: 62,
};

export function SunIcon ({
    rays,
    thickness = 3,
    body = .5,
    gap = .2,
    width,
    height,
    size = 'small',
} : SunProps) {

    const { edges, setEdges } = useStore();
    useControls({
        edges: {
            value: edges,
            onChange: setEdges,
        },
    });

    const r = (width && height) ? Math.min(width, height) : sizeMap[size];
    const rayMap : { [key in Size] : number } = {
        tiny: 8,
        small: 8,
        medium: 12,
        large: 12,
    };
    const rayCount = rays || rayMap[size];

    let rayPaths : [[number, number], [number, number]][] = [];
    for (let i = (rayCount); i > 0; i--) {
        const deg = Math.PI * 2 * (rayCount - i) / rayCount;
        const x1 = Math.cos(deg) * (body + gap) * r;
        const y1 = Math.sin(deg) * (body + gap) * r;
        const x2 = Math.cos(deg) * (r);
        const y2 = Math.sin(deg) * (r);
        rayPaths.push([[x1, y1], [x2, y2]]);
    }
    return <svg
        className={[Styles.root, edges ? Styles.edges : '', Styles[size]].join(' ')}
        viewBox={`-${r} -${r} ${r * 2} ${r * 2}`}
        strokeWidth={`${thickness}px`}
        style={{ width : width || sizeMap[size], height: height || sizeMap[size] }}
    >
        <circle r={r * body} />
        {rayPaths.map((ray, i) => <line key={`ray${i}`} x1={`${ray[0][0]}px`} y1={`${ray[0][1]}px`} x2={`${ray[1][0]}px`} y2={`${ray[1][1]}px`} />)}
    </svg>
};

interface MoonProps extends Props {
    body?: number;
    shadow?: number;
};

export function MoonIcon ({
    size = 'small',
    height,
    width,
    thickness = 2,
    body = .75,
    shadow = .75,
}: MoonProps) {
    const { edges, setEdges } = useStore();
    useControls({
        edges: {
            value: edges,
            onChange: setEdges,
        },
    });

    const r = (width && height) ? Math.min(width, height) : sizeMap[size];

    const shadowR = r * body * shadow;
    const shadowX = -r * body * shadow * .5;
    const shadowY = -r * body * shadow * .75;

    return <svg
        className={[Styles.root, edges ? Styles.edges : '', Styles[size]].join(' ')}
        viewBox={`-${r} -${r} ${r * 2} ${r * 2}`}
        strokeWidth={`${thickness}px`}
        style={{ width : width || sizeMap[size], height: height || sizeMap[size] }}
    >
        <mask id="shadow">
            <rect x={-r} y={-r} width={r*2} height={r*2} fill="white" />
            <circle r={shadowR} cx={shadowX} cy={shadowY} fill="black" />
        </mask>
        <mask id="body">
            <circle r={r * body} fill="white" />
        </mask>
        <circle r={shadowR} cx={shadowX} cy={shadowY} fill="transparent" mask="url(#body)" />
        <circle r={r * body} mask="url(#shadow)" />
    </svg>
};

interface MenuProps extends Props {};

export function MenuIcon ({
    size = 'small',
    thickness = 2,
    width,
    height,
} : MenuProps) {
    const { edges, setEdges } = useStore();
    useControls({
        edges: {
            value: edges,
            onChange: setEdges,
        },
    });
    
    const r = (width && height) ? Math.min(width, height) : sizeMap[size];

    return <svg
        className={[Styles.root, edges ? Styles.edges : '', Styles[size]].join(' ')}
        viewBox={`-${r} -${r} ${r * 2} ${r * 2}`}
        strokeWidth={`${thickness}px`}
        style={{ width : width || sizeMap[size], height: height || sizeMap[size] }}
    >
        <line x1={-r * .8} x2={r * .8} y1={r * .33} y2={r * .33}></line>
        <line x1={-r * .8} x2={r * .8} y1={-r * .33} y2={-r * .33}></line>
    </svg>
};
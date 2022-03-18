import React from 'react'
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
    onClick?: (e : React.MouseEvent) => void;
    flush?: boolean;
    size?: Size;
}

type Size = 'tiny' | 'small' | 'medium' | 'large' | 'xl';

const sizeMap : { [key in Size] : number } = {
    tiny: 16,
    small: 24,
    medium: 40,
    large: 56,
    xl: 80,
}

export default function Button ({
    flush = false,
    onClick,
    children,
    size = 'medium',
} : Props) {
    const w = sizeMap[size], height = w, p = w/2;
    return <div
        className={[Styles.root, flush ? Styles.flush : '', Styles[size]].join(' ')}
        onClick={onClick}
        style={{ height, minWidth: w }}
    >
        <div className={Styles.frame} style={{ borderRadius: p }} />
        <div className={Styles.body} style={{ borderRadius: p, padding: flush ? '' : `0 ${p}px` }}>
            {children}
        </div>
    </div>
}
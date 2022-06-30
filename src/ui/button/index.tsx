import React from 'react'
import Spinner from '../spinner';
import Styles from './styles.module.css'

export interface Props {
    children?: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
    flush?: boolean;
    size?: Size;
    alt?: boolean;
    icon?: React.ReactNode;
    full?: boolean;
    disabled?: boolean;
    error?: string;
    active?: boolean;
    loading?: boolean;
}

export type Size = 'tiny' | 'small' | 'medium' | 'large' | 'xl';

const sizeMap: { [key in Size]: number } = {
    tiny: 16,
    small: 24,
    medium: 40,
    large: 56,
    xl: 80,
}

export default function Button({
    flush = false,
    onClick,
    children,
    size = 'medium',
    alt = false,
    icon,
    full = false,
    disabled = false,
    error,
    active,
    loading = false,
}: Props) {
    const w = sizeMap[size], height = w, p = w / 2;
    return <div
        aria-disabled={disabled}
        className={[
            Styles.root,
            flush ? Styles.flush : '',
            full ? Styles.full : '',
            Styles[size],
            alt ? Styles.alt : '',
            disabled ? Styles.disabled : '',
            error ? Styles.error : '',
            active ? Styles.active : '',
            loading ? Styles.loading : '',
        ].join(' ')}
        onClick={e => !disabled && onClick && onClick(e)}
        style={{ height, minWidth: w }}
    >
        <div className={Styles.frame} style={{ borderRadius: p }} />
        <div className={Styles.loader}><Spinner size='small' /></div>
        <div className={[Styles.body, icon ? Styles.hasIcon : '',].join(' ')} style={{ borderRadius: p, padding: flush ? '' : `0 ${p}px` }}>
            {icon && <div className={Styles.icon} children={icon} />}
            {children}
        </div>
    </div>
}
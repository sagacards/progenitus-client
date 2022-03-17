import React from 'react'
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
    onClick?: (e : React.MouseEvent) => void;
    flush?: boolean;
}

export default function Button ({
    flush = false,
    onClick,
    children
} : Props) {
    return <div className={[Styles.root, flush ? Styles.flush : ''].join(' ')} onClick={onClick}>
        <div className={Styles.frame} />
        <div className={Styles.body}>
            {children}
        </div>
    </div>
}
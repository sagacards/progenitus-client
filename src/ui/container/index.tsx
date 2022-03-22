import React from 'react'
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
    size?: 'narrow' | 'standard';
}

export default function Container ({
    children,
    size = 'standard',
} : Props) {
    return <div className={Styles.root}>
        <div className={[Styles.container, Styles[size]].join(' ')}>
            {children}
        </div>
    </div>
}
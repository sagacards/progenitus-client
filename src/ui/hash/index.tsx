import React from 'react'
import Styles from './styles.module.css'

interface Props {
    children: React.ReactNode;
}

export default function Hash ({ children } : Props) {
    return <div className={Styles.root}>
        {children?.toString().slice(0, 4)}...{children?.toString().slice(-3)}
    </div>
}
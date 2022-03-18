import React from 'react'
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
}

export default function Footer (props : Props) {
    return <div className={Styles.root}>
        ...
    </div>
}
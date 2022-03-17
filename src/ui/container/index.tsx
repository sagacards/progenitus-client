import React from 'react'
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
}

export default function Container (props : Props) {
    return <div className={Styles.root}>
        <div className={Styles.container}>
            {props.children}
        </div>
    </div>
}
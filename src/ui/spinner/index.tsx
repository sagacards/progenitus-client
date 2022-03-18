import React from 'react'
import Styles from './styles.module.css'

interface Props {
}

export default function Spinner (props : Props) {
    return <div className={Styles.root}>
        <div className={Styles.inner} />
        <div className={Styles.ball} />
    </div>
}
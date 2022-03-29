import React from 'react'
import Styles from './styles.module.css'
import Seal from 'assets/logo.png'

interface Props {
    children?: React.ReactNode;
}

export default function Logo (props : Props) {
    return <div className={Styles.root}>
        <img src={Seal} className={Styles.image} />
    </div>
}
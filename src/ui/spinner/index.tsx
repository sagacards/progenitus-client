import React from 'react'
import Styles from './styles.module.css'

interface Props {
    size? : 'standard' | 'small';
}

export default function Spinner ({
    size = 'standard'
} : Props) {
    return <div className={[Styles.root, Styles[size]].join(' ')}>
        <div className={Styles.inner} />
        <div className={Styles.rotate}><div className={Styles.ball} /></div>
    </div>
}
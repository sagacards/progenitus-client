import { ICP8s } from 'api/_common';
import React from 'react'
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
    supply?: number,
    remaining?: number,
    price?: ICP8s,
}

export default function StatBar({
    supply,
    remaining,
    price,
}: Props) {
    return <div className={Styles.stats}>
        <div className={Styles.stat}>
            <div className={Styles.statLabel}>Supply</div>
            <div className={Styles.statValue}>{supply}</div>
        </div>
        <div className={Styles.stat}>
            <div className={Styles.statLabel}>Unminted</div>
            <div className={Styles.statValue}>{remaining}</div>
        </div>
        <div className={Styles.stat}>
            <div className={Styles.statLabel}>Price</div>
            <div className={Styles.statValue}>{price && price.e8s / 10 ** 8} ICP</div>
        </div>
    </div>
}
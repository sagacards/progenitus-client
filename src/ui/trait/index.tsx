import React from 'react'
import { Rarity } from 'api/rarity'
import Styles from './styles.module.css'

interface Props {
    label: string
    value: string
    rarity: Rarity
}

export function Trait({ label, value, rarity }: Props) {
    return <div className={[Styles.root, Styles[rarity]].join(' ')}>
        <div className={Styles.label}>{label}</div>
        <div className={Styles.value}>{value.replaceAll('-', ' ')}</div>
    </div>
}

export function Traits(props: { children?: React.ReactNode }) {
    return <div className={Styles.list}>
        {props.children}
    </div>
}
import { LegendEntry } from 'api/dab';
import React from 'react'
import Hash from 'ui/hash';
import Revealer from 'ui/revealer';
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
    banner?: string;
    thumbnail?: string;
    name?: string;
    description?: string
    address?: string;
}

export default function CollectionTop(props: Props) {
    return <div className={Styles.root}>
        <img className={Styles.banner} src={props?.banner} />
        <img className={Styles.thumbnail} src={props?.thumbnail} />
        <div className={Styles.name}>{props?.name}</div>
        {props.address && <div className={Styles.address}><Hash>{props.address}</Hash></div>}
        {props.description && <div className={Styles.description}><Revealer content={props.description} /></div>}
    </div>
}
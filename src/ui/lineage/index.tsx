import React from 'react'
import Hashatar from 'ui/hashatar';
import Styles from './styles.module.css'

import Saga from 'assets/disk/8.png'
import Hash from 'ui/hash';

interface Props {
    children?: React.ReactNode;
    minter  : string;
    collection : {
        name: string;
        icon?: string;
    }
}

export default function Lineage (props : Props) {
    return <div className={Styles.root}>
        <div className={Styles.item}>
            <div className={Styles.disk}><img className={Styles.image} src={Saga} /></div>
            <div className={Styles.tip}>Creator: Saga Cards</div>
        </div>
        <div className={Styles.item}>
            <div className={Styles.disk}>{props.collection.icon ? <img className={Styles.image} src={props.collection.icon} /> : <Hashatar name={props.collection.name} />}</div>
            <div className={Styles.tip}>Collection: {props.collection.name}</div>
        </div>
        <div className={Styles.item}>
            <div className={Styles.disk}><Hashatar name={props.minter} /></div>
            <div className={Styles.tip}>Minter: <Hash>{props.minter}</Hash></div>
        </div>
        {/* <div className={Styles.item}>
            <div className={Styles.disk}><Hashatar name="owner" /></div>
            <div className={Styles.tip}>Owner: ?</div>
        </div> */}
    </div>
}
import React from 'react'
import Hashatar from 'ui/hashatar';
import Styles from './styles.module.css'

import Saga from 'assets/disk/8.png'
import Hash from 'ui/hash';

interface Props {
    children?: React.ReactNode;
    to: string;
    from?: string;
    operation?: 'sale' | 'mint' | 'transfer';
    collection : {
        name: string;
        icon?: string;
    }
}

export default function Lineage (props : Props) {
    const toLabel = React.useMemo(() => props.operation === 'sale' ? 'buyer' : props.operation === 'mint' ? 'minter' : 'recipient', [props.operation]);
    const fromLabel = React.useMemo(() => props.operation === 'sale' ? 'seller' : props.operation === 'mint' ? 'agent' : 'sender', [props.operation]);
    return <div className={Styles.root}>
        <div className={Styles.item}>
            <div className={Styles.disk}><img className={Styles.image} src={Saga} /></div>
            <div className={Styles.tip}>Creator: Saga Cards</div>
        </div>
        <div className={Styles.item}>
            <div className={Styles.disk}>{props.collection.icon ? <img className={Styles.image} src={props.collection.icon} /> : <Hashatar name={props.collection.name} />}</div>
            <div className={Styles.tip}>Collection: {props.collection.name}</div>
        </div>
        {props.from && <div className={Styles.item}>
            <div className={Styles.disk}><Hashatar name={props.from} /></div>
            <div className={Styles.tip}>{fromLabel}: <Hash>{props.from}</Hash></div>
        </div>}
        <div className={Styles.item}>
            <div className={Styles.disk}><Hashatar name={props.to} /></div>
            <div className={Styles.tip}>{toLabel}: <Hash>{props.to}</Hash></div>
        </div>
        {/* <div className={Styles.item}>
            <div className={Styles.disk}><Hashatar name="owner" /></div>
            <div className={Styles.tip}>Owner: ?</div>
        </div> */}
    </div>
}
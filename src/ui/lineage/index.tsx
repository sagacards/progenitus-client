import React from 'react'
import Hashatar from 'ui/hashatar';
import Styles from './styles.module.css'

import Saga from 'assets/disk/8.png'
import Hash from 'ui/hash';

type operation = 'sale' | 'mint' | 'transfer' | 'listing';

interface Props {
    children?: React.ReactNode;
    to?: string;
    from?: string;
    operation: operation;
    collection?: {
        name: string;
        thumbnail: string;
    }
}

const toLabel = {
    'sale': 'buyer',
    'mint': 'minter',
    'transfer': 'recipient',
    'listing': 'seller',
}

const fromLabel = {
    'sale': 'seller',
    'mint': 'agent',
    'transfer': 'sender',
    'listing': 'seller',
}

export default function Lineage (props : Props) {
    return <div className={Styles.root}>
        <div className={Styles.item}>
            <div className={Styles.disk}><img className={Styles.image} src={Saga} /></div>
            <div className={Styles.tip}>Creator: Saga Cards</div>
        </div>
        <div className={Styles.item}>
            <div className={Styles.disk}>{props?.collection?.thumbnail ? <img className={Styles.image} src={props.collection.thumbnail} /> : <Hashatar name={props?.collection?.name} />}</div>
            <div className={Styles.tip}>Collection: {props?.collection?.name}</div>
        </div>
        {props.from && <div className={Styles.item}>
            <div className={Styles.disk}><Hashatar name={props.from} /></div>
            <div className={Styles.tip}>{fromLabel[props.operation]}: <Hash size='tiny'>{props.from}</Hash></div>
        </div>}
        {props.to && <div className={Styles.item}>
            <div className={Styles.disk}><Hashatar name={props.to} /></div>
            <div className={Styles.tip}>{toLabel[props.operation]}: <Hash size='tiny'>{props.to}</Hash></div>
        </div>}
        {/* <div className={Styles.item}>
            <div className={Styles.disk}><Hashatar name="owner" /></div>
            <div className={Styles.tip}>Owner: ?</div>
        </div> */}
    </div>
}
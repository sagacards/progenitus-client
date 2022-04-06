import React from 'react'
import Hashatar from 'ui/hashatar';
import Styles from './styles.module.css'

import Saga from 'assets/disk/8.png'

interface Props {
    children?: React.ReactNode;
}

export default function Lineage (props : Props) {
    return <div className={Styles.root}>
        <div className={Styles.item}>
            <div className={Styles.disk}><img className={Styles.image} src={Saga} /></div>
            <div className={Styles.tip}>Creator: Saga Cards</div>
        </div>
        <div className={Styles.item}>
            <div className={Styles.disk}><Hashatar name="collection" /></div>
            <div className={Styles.tip}>Collection: </div>
        </div>
        <div className={Styles.item}>
            <div className={Styles.disk}><Hashatar name="minter" /></div>
            <div className={Styles.tip}>Minter: ?</div>
        </div>
        <div className={Styles.item}>
            <div className={Styles.disk}><Hashatar name="owner" /></div>
            <div className={Styles.tip}>Owner: ?</div>
        </div>
    </div>
}
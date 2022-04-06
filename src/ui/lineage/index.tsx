import React from 'react'
import ReactHashAvatar from 'react-hash-avatar'
import Hashatar from 'ui/hashatar';
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
}

export default function Lineage (props : Props) {
    return <div className={Styles.root}>
        <div className={Styles.item}>
            <div className={Styles.disk}><Hashatar name="creator" /></div>
            <div className={Styles.tip}>Created By</div>
        </div>
        <div className={Styles.item}>
            <div className={Styles.disk}><Hashatar name="collection" /></div>
            <div className={Styles.tip}>Collection</div>
        </div>
        <div className={Styles.item}>
            <div className={Styles.disk}><Hashatar name="minter" /></div>
            <div className={Styles.tip}>Minted By</div>
        </div>
        <div className={Styles.item}>
            <div className={Styles.disk}><Hashatar name="owner" /></div>
            <div className={Styles.tip}>Current Owner</div>
        </div>
    </div>
}
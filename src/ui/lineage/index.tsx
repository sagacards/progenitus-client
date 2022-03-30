import React from 'react'
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
}

export default function Lineage (props : Props) {
    return <div className={Styles.root}>
        <div className={Styles.creator}>
            <div className={Styles.disk} />
            <div className={Styles.tip}>Created By</div>
        </div>
        <div className={Styles.collection}>
            <div className={Styles.disk} />
            <div className={Styles.tip}>Collection</div>
        </div>
        <div className={Styles.minter}>
            <div className={Styles.disk} />
            <div className={Styles.tip}>Minted By</div>
        </div>
        <div className={Styles.owner}>
            <div className={Styles.disk} />
            <div className={Styles.tip}>Current Owner</div>
        </div>
    </div>
}
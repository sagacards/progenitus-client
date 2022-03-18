import Styles from './styles.module.css'
import React from 'react';
import Button from 'ui/button';
import Plug from 'assets/wallet/plug.png'
import Stoic from 'assets/wallet/stoic.png'
import II from 'assets/wallet/ii.png'
import Earth from 'assets/wallet/earth.png'

interface Props {};

export default function ConnectPage (props : Props) {
    return <div className={Styles.root}>
        <div className={Styles.art}></div>
        <div className={Styles.content}>
            <h1>Connect</h1>
            <div className={Styles.wallets}>
                <Button
                    size="large"
                    icon={<img src={Plug} />}
                    onClick={() => alert(`🙈 Coming Soon...`)}
                >Plug Wallet</Button>
                <Button
                    size="large"
                    icon={<img src={Stoic} />}
                    onClick={() => alert(`🙈 Coming Soon...`)}
                >Stoic Wallet</Button>
                <Button
                    size="large"
                    icon={<img src={II} />}
                    onClick={() => alert(`🙈 Coming Soon...`)}
                >Internet Identity</Button>
                <Button
                    size="large"
                    icon={<img src={Earth} />}
                    onClick={() => alert(`🙈 Coming Soon...`)}
                >Earth Wallet</Button>
            </div>
        </div>
    </div>
};
import Styles from './styles.module.css'
import React from 'react';
import Button from 'ui/button';
import Plug from 'assets/wallet/plug.png'
import Stoic from 'assets/wallet/stoic.png'
import II from 'assets/wallet/ii.png'
import Earth from 'assets/wallet/earth.png'
import useStore from 'stores/index';
import Spinner from 'ui/spinner';
import { Navigate } from 'react-router-dom';

interface Props {};

export default function ConnectPage (props : Props) {
    const { stoicConnect, plugConnect, connecting, connected } = useStore();
    if (connected) return <Navigate to="/" />
    return <div className={Styles.root}>
        <div className={Styles.art}></div>
        <div className={Styles.content}>
            <h1>Connect</h1>
            <div className={Styles.wallets}>
                <Button
                    size="large"
                    icon={<img src={Plug} />}
                    onClick={plugConnect}
                >{connecting ? <div className={Styles.spinner}><Spinner /></div> : 'Plug Wallet'}</Button>
                <Button
                    size="large"
                    icon={<img src={Stoic} />}
                    onClick={stoicConnect}
                >{connecting ? <div className={Styles.spinner}><Spinner /></div> : 'Stoic Wallet'}</Button>
                <Button
                    size="large"
                    icon={<img src={II} />}
                    onClick={() => alert(`🙈 Coming Soon...`)}
                >{connecting ? <div className={Styles.spinner}><Spinner /></div> : 'Internet Identity'}</Button>
                <Button
                    size="large"
                    icon={<img src={Earth} />}
                    onClick={() => alert(`🙈 Coming Soon...`)}
                >{connecting ? <div className={Styles.spinner}><Spinner /></div> : 'Earth Wallet'}</Button>
            </div>
        </div>
    </div>
};
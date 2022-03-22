import Styles from './styles.module.css'
import React from 'react';
import Button from 'ui/button';
import useStore from 'stores/index';
import Spinner from 'ui/spinner';
import { Navigate } from 'react-router-dom';
import WalletIcon from 'ui/wallet-icon';

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
                    icon={<WalletIcon wallet='plug' />}
                    onClick={plugConnect}
                >{connecting ? <div className={Styles.spinner}><Spinner /></div> : 'Plug Wallet'}</Button>
                <Button
                    size="large"
                    icon={<WalletIcon wallet='stoic' />}
                    onClick={stoicConnect}
                >{connecting ? <div className={Styles.spinner}><Spinner /></div> : 'Stoic Wallet'}</Button>
                <Button
                    size="large"
                    icon={<WalletIcon wallet='ii' />}
                    onClick={() => alert(`🙈 Coming Soon...`)}
                >{connecting ? <div className={Styles.spinner}><Spinner /></div> : 'Internet Identity'}</Button>
                <Button
                    size="large"
                    icon={<WalletIcon wallet='earth' />}
                    onClick={() => alert(`🙈 Coming Soon...`)}
                >{connecting ? <div className={Styles.spinner}><Spinner /></div> : 'Earth Wallet'}</Button>
            </div>
        </div>
    </div>
};
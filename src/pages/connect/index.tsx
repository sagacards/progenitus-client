import Styles from './styles.module.css'
import React from 'react';
import Button from 'ui/button';
import useStore from 'stores/index';
import Spinner from 'ui/spinner';
import { Navigate, useLocation } from 'react-router-dom';
import WalletIcon from 'ui/wallet-icon';
import Midday from 'assets/backdrop/bgc-midday.jpg'
import Midnight from 'assets/backdrop/bgc-midnight.jpg'
import Logo from 'ui/logo';
import useThemeStore from 'stores/theme';
import Page from 'pages/wrapper';

interface Props { };

export default function ConnectPage(props: Props) {
    const { stoicConnect, plugConnect, connecting, connected } = useStore();
    const { theme } = useThemeStore();
    const { state } = useLocation();
    if (connected) return <Navigate to={(state as any)?.referrer || "/"} />
    return <Page key="ConnectPage">
        <div className={Styles.root}>
            <div className={Styles.logo}>
                <Logo />
            </div>
            <div className={Styles.art}>
                <img className={[Styles.image, theme === 'dark' ? Styles.show : ''].join(' ')} src={Midnight} />
                <img className={[Styles.image, theme === 'light' ? Styles.show : ''].join(' ')} src={Midday} />
            </div>
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
    </Page>
};
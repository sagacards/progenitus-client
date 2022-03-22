import React from 'react'
import Styles from './styles.module.css'
import useStore, { Wallet } from 'stores/index'

import Plug from 'assets/wallet/plug.png'
import Stoic from 'assets/wallet/stoic.png'
import II from 'assets/wallet/ii.png'
import Earth from 'assets/wallet/earth.png'

interface Props {
    children?: React.ReactNode;
    wallet?: Wallet;
    size?: 'small';
}

const icons : { [key : string] : string } = {
    plug: Plug,
    stoic: Stoic,
    ii: II,
    earth: Earth
};

export default function WalletIcon (props : Props) {
    const { wallet } = useStore();
    const w = props.wallet || wallet;
    return <div className={[Styles.root, props.size ? Styles[props.size] : ''].join(' ')}>
        {w && <img className={Styles.img} src={icons[w]} />}
    </div>
}
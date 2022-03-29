import React from 'react'
import Styles from './styles.module.css'

import Midday from 'assets/backdrop/bgc-midday.jpg'
import Midnight from 'assets/backdrop/bgc-midnight.jpg'
import useStore from 'stores/index'

interface Props {
    children?: React.ReactNode;
}

export default function SplashPanel (props : Props) {
    const { colorScheme } = useStore();
    return <div className={Styles.root}>
        <img className={[Styles.image, colorScheme === 'dark' ? Styles.show : ''].join(' ')} src={Midnight} />
        <img className={[Styles.image, colorScheme === 'light' ? Styles.show : ''].join(' ')} src={Midday} />
    </div>
}
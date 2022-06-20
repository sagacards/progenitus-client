import React from 'react'
import Styles from './styles.module.css'

import Midday from 'assets/backdrop/bgc-midday.jpg'
import Midnight from 'assets/backdrop/bgc-midnight.jpg'
import useThemeStore from 'stores/theme'

interface Props {
    children?: React.ReactNode;
}

export default function SplashPanel (props : Props) {
    const { theme } = useThemeStore();
    return <div className={Styles.root}>
        <img className={[Styles.image, theme === 'dark' ? Styles.show : ''].join(' ')} src={Midnight} />
        <img className={[Styles.image, theme === 'light' ? Styles.show : ''].join(' ')} src={Midday} />
    </div>
}
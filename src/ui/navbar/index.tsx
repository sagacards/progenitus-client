import React from 'react'
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
}

export default function Navbar (props : Props) {
    const nav = [{
        name: 'Drops',
        path: '/drops',
    }];
    return <div className={Styles.root}>
        <div className={Styles.logo}>
            <div className={Styles.wordmark}>Progenitus</div>
        </div>
        <div className={Styles.nav}>
            {nav.map(i => <div key={`navitem${i.name}`} className={Styles.navItem}>
                {/* link to=i.path */}
                {i.name}
            </div>)}
        </div>
    </div>
}
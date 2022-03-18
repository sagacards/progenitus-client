import Styles from './styles.module.css'
import React from 'react'
import Button from 'ui/button'
import SchemeToggle from 'ui/scheme-toggle'
import { MenuIcon } from 'ui/svgcons'
import ICP from 'assets/currency/icp.png'
import Container from 'ui/container'

interface Props {
    children?: React.ReactNode;
}

export default function Navbar (props : Props) {
    const nav = [
        {
            name: 'Drops',
            path: '/drops',
        },
        {
            name: 'Collections',
            path: '/collections',
        },
        {
            name: 'Profile',
            path: '/profile',
        },
    ];
    const [open, setOpen] = React.useState<boolean>(false);
    return <div className={Styles.container}>
        <Container>
            <div className={Styles.root}>
                <div className={Styles.logo}>
                    <div className={Styles.wordmark}>Progenitus</div>
                </div>
                <div className={[Styles.breakNav, open ? Styles.open : ''].join(' ')}>
                    <div className={Styles.nav}>
                        {nav.map(i => <div key={`navitem${i.name}`} className={Styles.navItem}>
                            {/* link to=i.path */}
                            {i.name}
                        </div>)}
                    </div>
                    <div className={Styles.balance}>4 <span className={Styles.icp}>ICP</span> <img className={Styles.icpImg} src={ICP} /></div>
                    <Button onClick={() => alert(`that doesn't work yet 😅`)}>Connect</Button>
                </div>
                <div className={Styles.aside}>
                    <div className={Styles.scheme}><SchemeToggle /></div>
                    <div className={Styles.breakNavToggle}><Button flush onClick={() => setOpen(!open)}><MenuIcon /></Button></div>
                </div>
            </div>
        </Container>
    </div>
}
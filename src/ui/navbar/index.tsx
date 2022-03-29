import Styles from './styles.module.css'
import React from 'react'
import Button from 'ui/button'
import SchemeToggle from 'ui/scheme-toggle'
import { MenuIcon } from 'ui/svgcons'
import ICP from 'assets/currency/icp.png'
import Container from 'ui/container'
import { Link } from 'react-router-dom'
import useStore from 'stores/index'
import Logo from 'ui/logo'
import Spinner from 'ui/spinner'
import LineText from 'ui/line-text'

interface Props {
    children?: React.ReactNode;
}

export default function Navbar (props : Props) {
    const { connected, balance } = useStore();
    const nav : {name: string; path: string}[] = [
        // {
        //     name: 'Drops',
        //     path: '/drops',
        // },
        // {
        //     name: 'Collections',
        //     path: '/collections',
        // },
        // {
        //     name: 'Profile',
        //     path: '/profile',
        // },
    ];
    const [open, setOpen] = React.useState<boolean>(false);
    return <div className={Styles.container}>
        <Container>
            <div className={Styles.root}>
                <div className={Styles.logo}>
                    {/* <Link className="no-fancy" to="/">
                        <Logo />
                    </Link> */}
                    <Link className="no-fancy" to="/">
                        <LineText><div className={Styles.wordmark}>Bazaar</div></LineText>
                    </Link>
                </div>
                <div className={[Styles.breakNav, open ? Styles.open : ''].join(' ')}>
                    <div className={Styles.nav}>
                        {nav.map(i => <Link className="no-fancy" to={i.path} key={`navitem${i.name}`}>
                            <div className={Styles.navItem}>
                                {i.name}
                            </div>
                        </Link>)}
                    </div>
                    {connected && <div className={Styles.balance}>{balance !== undefined ? balance.toFixed(2) : <Spinner size='small' />} <span className={Styles.icp}>ICP</span> <img className={Styles.icpImg} src={ICP} /></div>}
                    {connected
                        ? <Link to="/account" className="no-fancy"><Button>Account</Button></Link>
                        : <Link to="/connect" className="no-fancy"><Button>Connect</Button></Link>
                    }
                </div>
                <div className={Styles.aside}>
                    <div className={Styles.scheme}><SchemeToggle /></div>
                    <div className={Styles.breakNavToggle}><Button flush onClick={() => setOpen(!open)}><MenuIcon /></Button></div>
                </div>
            </div>
        </Container>
    </div>
}
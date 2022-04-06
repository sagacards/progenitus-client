import React from 'react'
import { Link, useLocation, useMatch, useParams, useRoutes } from 'react-router-dom';
import Styles from './styles.module.css'

interface Props {
    tabs : [string, React.ReactNode][]
}

export default function Tabs ({ tabs } : Props) {
    const [hash, setHash] = React.useState(window.location.hash);
    const index = React.useMemo(() => Math.max(tabs.findIndex(tab => tab[0].toLowerCase() === hash.toLowerCase()), 0), [hash, tabs]);
    return <div className={Styles.root}>
        <div className={Styles.tabs}>
            {tabs.map((tab, i) => <div id={tab[0].toLowerCase()} className={[Styles.tab, index === i ? Styles.active : ''].join(' ')} key={`tab${tab[0]}`} onClick={() => { setHash(tab[0].toLowerCase()); window.location.hash = tab[0].toLowerCase() }}>
                {tab[0]}
            </div>)}
        </div>
        <div className={Styles.body}>
            {tabs[index][1]}
        </div>
    </div>
}
import React from 'react'
import DropCard from '.';
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
}

export default function DropCardList (props : Props) {
    const drops = [{}, {}, {},]
    return <div className={Styles.list}>
        {drops.map((drop, i) => <DropCard key={`drop${i}`} />)}
    </div>
}
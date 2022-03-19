import React from 'react'
import DropCard from '.';
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
}

export default function DropCardList (props : Props) {
    const drops = [{
        name: 'The High Priestess',
        slug: 'the-high-priestess',
    }, {
        name: 'The Empress',
        slug: 'the-empress',
    }, {
        name: 'The Emperor',
        slug: 'the-emperor',
    },]
    return <div className={Styles.list}>
        {drops.map((drop, i) => <DropCard key={`drop${i}`} name={drop.name} slug={drop.slug} />)}
    </div>
}
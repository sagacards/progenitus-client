import React from 'react'
import CollectionCard from '.';
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
}

export default function CollectionCardList (props : Props) {
    const drops = [{
        name: 'The Fool',
        slug: 'the-fool',
    }, {
        name: 'The Magician',
        slug: 'the-magician',
    }, {
        name: 'Chaos R.W.S.',
        slug: 'chaos-rws',
    }, {
        name: 'The High Priestess',
        slug: 'the-high-priestess',
    }, {
        name: 'The Empress',
        slug: 'the-empress',
    },]
    return <div className={Styles.list}>
        {drops.map((drop, i) => <CollectionCard key={`drop${i}`} name={drop.name} slug={drop.slug} />)}
    </div>
}
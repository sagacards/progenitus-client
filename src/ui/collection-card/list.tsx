import React from 'react'
import CollectionCard from '.';
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
}

export default function CollectionCardList (props : Props) {
    const drops = [{}, {}, {}, {},]
    return <div className={Styles.list}>
        {drops.map((drop, i) => <CollectionCard key={`drop${i}`} />)}
    </div>
}
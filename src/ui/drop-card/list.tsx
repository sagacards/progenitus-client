import React from 'react'
import useStore from 'stores/index'
import DropCard from '.'
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
}

export default function DropCardList (props : Props) {
    const { events } = useStore();
    const drops = [{
        name: 'The High Priestess',
        slug: 'the-high-priestess',
        art: 'https://i.imgur.com/bwhO0bI.mp4',
    }, {
        name: 'The Empress',
        slug: 'the-empress',
        art: 'https://i.imgur.com/feyHN2U.mp4',
    }, {
        name: 'The Emperor',
        slug: 'the-emperor',
        art: 'https://i.imgur.com/8cOXOCE.mp4',
    },]
    return <div className={Styles.list}>
        {Object.values(events).map((drop, i) => <DropCard key={`drop${i}`} name={drop.collection.name} id={drop.id} art={drops[i].art} />)}
    </div>
}
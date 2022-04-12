import React from 'react'
import { MintingEvent } from 'src/logic/minting';
import useStore from 'stores/index'
import DropCard from '.'
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
}

export default function DropCardList (props : Props) {
    const { events } = useStore();
    const e = React.useMemo(() => Object.values(events).reduce((agg, e) => ([...Object.values(agg), ...Object.values(e)]), [] as MintingEvent[]), [events]);
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
    }]
    return <div className={Styles.list}>
        {Object.values(e).slice(0, 3).map((drop, i) => <DropCard key={`drop${i}`} name={drop.collection.name} canister={drop.collection.canister} id={drop.id} art={drops[i].art} start={drop.startDate} end={drop.endDate} />)}
    </div>
}
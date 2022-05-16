import { DateTime } from 'luxon';
import React from 'react'
import { eventIsTimeGated, MintingEvent } from 'src/logic/minting';
import useStore from 'stores/index'
import DropCard from '.'
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
}

export default function DropCardList (props : Props) {
    const { events } = useStore();
    const e = React.useMemo(() => Object.values(events).reduce((agg, e) => ([...Object.values(agg), ...Object.values(e).filter(e => !eventIsTimeGated(e) || e.endDate.toMillis() > DateTime.now().toMillis())]), [] as MintingEvent[]), [events]);
    return <div className={Styles.list}>
        {Object.values(e).slice(0, 3).map((drop, i) => <DropCard key={`drop${i}`} name={drop.collection.name} canister={drop.collection.canister} id={drop.id} art={drop.collection.preview} start={drop.startDate} end={drop.endDate} />)}
    </div>
}
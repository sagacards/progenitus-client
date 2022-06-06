import { useUnminted } from 'api/legends';
import React from 'react'
import CollectionCard from '.';
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
}

export default function CollectionCardList(props: Props) {
    const unminted = useUnminted()
    const mintable = React.useMemo(() => {
        return Object.values(unminted).filter(x => x.unminted > 0)
    }, [unminted])
    return <div className={Styles.list}>
        {mintable.map((drop, i) => <CollectionCard unminted={drop.unminted} key={`drop${i}`} thumbnail={drop.data.thumbnail} bannerImage={drop.data.bannerImage} name={drop.data.name} slug={drop.data.principal} />)}
    </div>
}
import React from 'react'
import { Link } from 'react-router-dom';
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
    name: string;
    slug: string;
}

export default function CollectionCard (props : Props) {
    
    return <Link className={[Styles.card, 'no-fancy'].join(' ')} to={`/collection/${props.slug}`}>
        <div className={Styles.art}></div>
        <div className={Styles.collection}></div>
        <div className={Styles.name}>{props.name}</div>
        <div className={Styles.supply}>20 Unminted</div>
    </Link>
}
import React from 'react'
import { Link } from 'react-router-dom';
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
    name: string;
    slug: string;
    unminted: number;
    thumbnail: string;
    bannerImage: string;
}

export default function CollectionCard(props: Props) {

    return <Link className={[Styles.card, 'no-fancy'].join(' ')} to={`/collection/${props.slug}`}>
        <img className={Styles.art} src={props.bannerImage} />
        <img className={Styles.collection} src={props.thumbnail} />
        <div className={Styles.name}>{props.name}</div>
        <div className={Styles.supply}>{props.unminted} Mints Available</div>
    </Link>
}
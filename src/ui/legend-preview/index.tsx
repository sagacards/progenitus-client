import React from 'react'
import { Link } from 'react-router-dom';
import Styles from './styles.module.css'

interface Props {
    title: string;
    flavour: string;
    featured: boolean;
    image: string;
};

export default function LegendPreview (props: Props) {
    return <div className={Styles.root}>
        <Link className={`no-fancy ${Styles.body}`} to={`/collection/nges7-giaaa-aaaaj-qaiya-cai`}>
            <div className={Styles.title}>{props.title}</div>
            <div className={Styles.flavour}>{props.flavour}</div>
            <img className={Styles.image} src={props.image} />
        </Link>
    </div>
};

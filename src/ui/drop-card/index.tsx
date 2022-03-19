import React from 'react'
import { Link } from 'react-router-dom';
import Button from 'ui/button';
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
    name: string;
    slug: string;
}

export default function DropCard (props : Props) {
    
    return <div className={Styles.dropcard}>
        <div className={Styles.art}></div>
        <div className={Styles.collection}></div>
        <div className={Styles.text}>
            <div className={Styles.name}>{props.name}</div>
            <div className={Styles.timer}>Starts 00:00:00:00</div>
        </div>
        <Link className="no-fancy" to={`/drops/${props.slug}`}>
            <Button>Drop Details</Button>
        </Link>
    </div>
}
import React from 'react'
import { Link } from 'react-router-dom';
import Button from 'ui/button';
import Styles from './styles.module.css'

import Disk from 'assets/disk/8.png'

interface Props {
    children?: React.ReactNode;
    name: string;
    slug: string;
    art: string;
}

export default function DropCard (props : Props) {
    
    return <div className={Styles.dropcard}>
        <div className={Styles.artStage}>
            <video className={Styles.art} autoPlay controls={false} muted loop>
                <source type="video/mp4" src={props.art} />
            </video>
        </div>
        <img className={Styles.collection} src={Disk} />
        <div className={Styles.text}>
            <div className={Styles.name}>{props.name}</div>
            <div className={Styles.timer}>Starts 00:00:00:00</div>
        </div>
        <Link className="no-fancy" to={`/drops/${props.slug}`}>
            <Button>Drop Details</Button>
        </Link>
    </div>
}
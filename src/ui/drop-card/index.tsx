import React from 'react'
import { Link } from 'react-router-dom';
import Button from 'ui/button';
import Styles from './styles.module.css'

import Disk from 'assets/disk/8.png'
import Timer from 'ui/timer';
import { DateTime } from 'luxon';

interface Props {
    children?: React.ReactNode;
    name: string;
    canister: string;
    id: number;
    art: string;
    start: DateTime;
    end: DateTime;
}

export default function DropCard (props : Props) {
    
    return <div className={Styles.dropcard}>
        <div className={Styles.artStage}>
            {/* <video className={Styles.art} autoPlay controls={false} muted loop>
                <source type="video/mp4" src={props.art} />
            </video> */}
            <img className={Styles.art} src={props.art} />
        </div>
        <img className={Styles.collection} src={Disk} />
        <div className={Styles.text}>
            <div className={Styles.name}>{props.name}</div>
            <div className={Styles.timer}>
                <div className={Styles.sizzle}>
                    {
                        props.start.toMillis() > DateTime.now().toMillis()
                        ? <>Starts <Timer time={props.start} /></>
                        : <>Ends <Timer time={props.end} /></>
                    }
                </div>
            </div>
        </div>
        <Link className="no-fancy" to={`/drops/${props.canister}/${props.id}`}>
            <Button>Drop Details</Button>
        </Link>
    </div>
}
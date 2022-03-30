import React from 'react'
import Styles from './styles.module.css'

interface Props {
    content: string;
}

export default function Revealer ({ content } : Props) {
    const [show, setShow] = React.useState(false);
    return <div className={Styles.root}>
        {
            show
            ? <>{content} <br /><br /> <a href="#" onClick={() => setShow(false)}>Read Less</a></>
            : <>{content.split(' ').slice(0, 30).join(' ')} ... <a href="#" onClick={() => setShow(true)}>Read More</a></>
        }
    </div>
}
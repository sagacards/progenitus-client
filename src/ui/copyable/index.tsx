import React from 'react'
import { FaRegCopy } from 'react-icons/fa';
import Styles from './styles.module.css'

interface Props {
    children: string;
}

export default function Copyable (props : Props) {
    const handleClick = React.useMemo(() => () => {
        alert('Copied!');
        navigator.clipboard.writeText(props.children);
    }, []);
    return <div className={Styles.root} onClick={handleClick}>
        {props.children}
        <div className={Styles.copy}><FaRegCopy /></div>
    </div>
}
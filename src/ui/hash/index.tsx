import React from 'react'
import useMessageStore from 'stores/messages';
import Styles from './styles.module.css'

interface Props {
    children: React.ReactNode;
    icon?: React.ReactNode;
    size?: 'large' | 'tiny';
    alt?: boolean
}

export default function Hash ({ children, icon, size, alt } : Props) {
    const { pushMessage } = useMessageStore();
    return <div className={[Styles.root, size ? Styles[size] : '', alt ? Styles.alt : ''].join(' ')} title={children?.toString()} onClick={() => { pushMessage({ type: 'info', message: 'Copied!' }); navigator.clipboard.writeText(children?.toString() as string) }}>
        {icon && <div className={Styles.icon}>{icon}</div>}
        {children?.toString().slice(0, 4)}...{children?.toString().slice(-3)}
    </div>
}
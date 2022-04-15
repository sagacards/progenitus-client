import React from 'react'
import Button from 'ui/button';
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode[];
};

const interval = 8;

export default function More ({ children } : Props) {
    const total = React.useMemo(() => children?.length, [children]);
    const [visible, setVisible] = React.useState(interval);
    const visibleNodes = React.useMemo(() => {
        return children?.slice(0, visible)
    }, [children, visible, total]);
    return <>
        {visibleNodes}
        {children && <Button full size='large' onClick={() => setVisible(visible + interval)}>More</Button>}
    </>
} 
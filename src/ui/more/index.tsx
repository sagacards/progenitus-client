import React from 'react'
import Button from 'ui/button';

interface Props {
    children?: React.ReactNode[];
    interval?: number;
};

export default function More({ children, interval = 8 }: Props) {
    const total = React.useMemo(() => children?.length, [children]);
    const [visible, setVisible] = React.useState(interval);
    const visibleNodes = React.useMemo(() => {
        return children?.slice(0, visible)
    }, [children, visible, total, interval]);
    return <>
        {visibleNodes}
        {children && visibleNodes && visibleNodes.length < children.length && <Button full size='large' onClick={() => setVisible(visible + interval)}>More</Button>}
    </>
} 
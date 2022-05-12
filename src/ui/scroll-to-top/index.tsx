import React from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop () {
    const location = useLocation();
    React.useEffect(() => {
        if(location.hash) {
            window.scrollTo(0, (document.querySelector<HTMLElement>(location.hash)?.offsetTop || 0) - 78);
        } else {
            window.scrollTo(0, 0);
        }
    }, [location]);
    return <></>
};
import React from 'react'
import Spinner from 'ui/spinner';
import Styles from './styles.module.css'

interface Props {
    uri: string;
    asset: React.ReactNode;
    className?: string;
    type: 'iframe' | 'image' | 'video';
}

export default function AssetPreload({ uri, asset, className, type }: Props) {

    const [ready, setReady] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (type === 'iframe') {
            fetch(uri).then(() => setReady(true));
        } else if (type === 'image') {
            const img = new Image();
            img.onload = () => setReady(true);
            img.src = uri;
        } else if (type === 'video') {
            fetch(uri).then(r => setReady(true));
        }
    }, []);

    return <div className={[Styles.root, ready ? Styles.ready : '', className].join(' ')}>
        {<div className={Styles.asset}>{asset}</div>}
        <Spinner />
    </div>
}
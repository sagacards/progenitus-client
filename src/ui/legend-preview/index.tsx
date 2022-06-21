import React from 'react';
import { Link } from 'react-router-dom';
import Styles from './styles.module.css'

interface Props {
    title: string;
    flavour: string;
    featured: boolean;
    image: string;
    canister?: string;
};

export default function LegendPreview(props: Props) {
    const hasCanister = React.useMemo(() => props?.canister, [props])
    return <div className={Styles.root}>
        <Link className={`no-fancy ${Styles.body} ${!props?.canister && Styles.disabled}`} to={`/collection/${props?.canister}`}>
            <div className={Styles.title}>{props.title}</div>
            <div className={Styles.flavour}>{props.flavour}</div>
            {!hasCanister && <div className={Styles.comingSoon}>Coming Soon</div>}
        </Link>
        <img className={Styles.image} src={props.image} />
    </div>
};

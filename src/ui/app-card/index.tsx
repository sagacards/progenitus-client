import React from 'react';
import Styles from './styles.module.css';

interface Props {
    previewImage: string;
    name: string;
    url: string;
    tagline: string;
}

export default function AppCard(props: Props) {
    return (
        <div className={Styles.root}>
            <a
                className={[Styles.link, 'no-fancy'].join(' ')}
                href={props.url}
                target="_blank"
            >
                <img
                    alt={props.name}
                    className={Styles.art}
                    src={props.previewImage}
                />
                {/* <div>{props.name}</div> */}
                <div className={Styles.tagline}>{props.tagline}</div>
                <div className={Styles.category}>App</div>
            </a>
        </div>
    );
}

export function AppCardList(props: { children?: React.ReactNode }) {
    return <div className={Styles.list}>{props.children}</div>;
}

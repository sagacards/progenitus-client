import Styles from './styles.module.css'
import React from 'react';
import Page from 'pages/wrapper';

interface Props { };

export default function NewPage(props: Props) {
    return <Page key="NewPage">
        <div className={Styles.root}>
            ...
        </div>
    </Page>;
};
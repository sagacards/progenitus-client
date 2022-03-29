import Styles from './styles.module.css'
import React from 'react';
import Navbar from 'ui/navbar';
import Footer from 'ui/footer';
import Container from 'ui/container';

import Disk from 'assets/disk/8.png'

interface Props {};

export default function DropDetailPage (props : Props) {
    return <>
        <Navbar />
        <Container>
            <div className={Styles.root}>
                <div className={Styles.top}>
                    <div className={Styles.banner}></div>
                    <img className={Styles.collection} src={Disk} />
                </div>
                <div className={Styles.name}>Drop Name</div>
                <div className={Styles.description}></div>
                <div className={Styles.stats}>
                    <div className={Styles.stat}></div>
                    <div className={Styles.stat}></div>
                    <div className={Styles.stat}></div>
                    <div className={Styles.stat}></div>
                    <div className={Styles.stat}></div>
                    <div className={Styles.stat}></div>
                </div>
            </div>
        </Container>
        <Footer />
    </>;
};
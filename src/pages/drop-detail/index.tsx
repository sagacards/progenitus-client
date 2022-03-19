import Styles from './styles.module.css'
import React from 'react';
import Navbar from 'ui/navbar';
import Footer from 'ui/footer';
import Container from 'ui/container';

interface Props {};

export default function DropDetailPage (props : Props) {
    return <>
        <Navbar />
        <Container>
            <div className={Styles.root}>
                <div className={Styles.top}>
                    <div className={Styles.banner}></div>
                    <div className={Styles.collection}></div>
                </div>
                <div className={Styles.name}>Collection Name</div>
                <div className={Styles.description}></div>
                <div className={Styles.stats}>
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
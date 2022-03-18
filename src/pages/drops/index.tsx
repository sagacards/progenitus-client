import Styles from './styles.module.css'
import React from 'react';
import Footer from 'ui/footer';
import Navbar from 'ui/navbar';
import Container from 'ui/container';

interface Props {};

export default function DropsPage (props : Props) {
    return <>
        <Navbar />
        <Container>
            <div className={Styles.root}>
                <h1>Drops</h1>
            </div>
        </Container>
        <Footer />
    </>
};
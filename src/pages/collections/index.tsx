import Styles from './styles.module.css'
import React from 'react';
import Navbar from 'ui/navbar';
import Footer from 'ui/footer';
import Container from 'ui/container';

interface Props {};

export default function CollectionsPage (props : Props) {
    return <>
        <Navbar />
        <Container>
            <div className={Styles.root}>
                <h1>Collections</h1>
            </div>
        </Container>
        <Footer />
    </>
};
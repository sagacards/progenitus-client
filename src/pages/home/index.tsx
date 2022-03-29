import Styles from './styles.module.css'
import React from 'react';
import Container from 'ui/container';
import SplashPanel from 'ui/splash-panel';
import LineText from 'ui/line-text';
import Button from 'ui/button';
import DropCardList from 'ui/drop-card/list';
import CollectionCardList from 'ui/collection-card/list';
import { Link } from 'react-router-dom';
import Navbar from 'ui/navbar';
import Footer from 'ui/footer';
import useStore from 'stores/index';

interface Props {};

export default function HomePage () {
    const { connected } = useStore();
    return <>
        <Navbar />
        <Container>
            <div className={Styles.root}>
                <div className={Styles.splash}>
                    <SplashPanel />
                    <div className={Styles.tagline}>
                        <strong>The Bazaar</strong> is the <span className={Styles.rainbow}>Saga Tarot NFT Drop Hub</span> where we are bringing Open Tarot to life, one Legend mint at a time
                    </div>
                </div>
                {!connected && <Link className="no-fancy" to="/connect"><Button size="xl">Connect</Button></Link>}
                <div className={Styles.drops}>
                    <h2><LineText>Upcoming Drops</LineText></h2>
                    <DropCardList />
                </div>
                {/* <div className={Styles.collections}>
                    <h2><LineText>Collections</LineText></h2>
                    <CollectionCardList />
                </div> */}
            </div>
        </Container>
        <Footer />
    </>
};
import Styles from './styles.module.css'
import React from 'react';
import Container from 'ui/container';
import SplashPanel from 'ui/splash-panel';
import LineText from 'ui/line-text';
import Button from 'ui/button';
import DropCardList from 'ui/drop-card/list';
import CollectionCardList from 'ui/collection-card/list';

interface Props {};

export default function HomePage () {
    return <>
        <Container>
            <div className={Styles.root}>
                <div className={Styles.splash}>
                    <SplashPanel />
                    <div className={Styles.tagline}>
                        Project Progenitus is the <span className={Styles.rainbow}>Saga Tarot NFT Drop Hub</span> where we are bringing Open Tarot to life, one Legend mint at a time
                    </div>
                </div>
                <Button size="xl" onClick={() => alert(`that doesn't work yet 😅`)}>Connect</Button>
                <div className={Styles.drops}>
                    <h2><LineText>Upcoming Drops</LineText></h2>
                    <DropCardList />
                </div>
                <div className={Styles.collections}>
                    <h2><LineText>Collections</LineText></h2>
                    <CollectionCardList />
                </div>
            </div>
        </Container>
    </>
};
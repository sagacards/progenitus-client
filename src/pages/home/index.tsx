import React from 'react';
import { Link } from 'react-router-dom';

import useStore, { CAPEvent } from 'stores/index';
import { useTokenStore } from 'stores/provenance';
import { TarotDeckData } from 'src/apis/cards';

import Button from 'ui/button';
import CollectionCardList from 'ui/collection-card/list';
import Container from 'ui/container';
import Footer from 'ui/footer';
import Grid from 'ui/grid';
import LegendPreview from 'ui/legend-preview';
import More from 'ui/more';
import Navbar from 'ui/navbar';
import NFTPreview from 'ui/nft-preview';
import ScrollRow from 'ui/scroll-row';

import Styles from './styles.module.css'

interface Props {};

export default function HomePage () {
    const { connected } = useStore();
    const { cap, capPoll, filtersSet, capRoots } = useTokenStore();

    const cards = React.useMemo(() => {
        const cards = Array(22).fill(undefined).map((x, i) => ({
            title: TarotDeckData[i].name,
            flavour: TarotDeckData[i].keywords.slice(0, 3).join(', '),
            image: '',
            featured: false,
        }));
        cards[0].featured = true;
        return cards;
    }, []);

    const recent = React.useMemo(() => Object.values(cap).flat().sort((a, b) => b.time.getTime() - a.time.getTime()), [cap]);
    return <>
        <Navbar />
        <Container>
            <div className={Styles.root}>
                <ScrollRow>
                    {cards.map((card, i) => <LegendPreview {...card} key={`card-${card.title}`} />)}
                </ScrollRow>
                <div className={Styles.splash}>
                    <h2>The Open Tarot Marketplace</h2>
                    <div className={Styles.tagline}>
                        Buy, sell and trade digital tarot collectibles that work with apps in the Open Tarot ecosystem
                    </div>
                </div>
                {!connected && <Link className="no-fancy" to="/connect"><Button size="xl">Connect</Button></Link>}
                <div className={Styles.collections}>
                    <h2>Mintable Collections</h2>
                    <CollectionCardList />
                </div>
                <div className={Styles.collections}>
                    <h2>Recent Activity</h2>
                    <ScrollRow>
                        {recent ?
                            recent.slice(0, 12).map(x => <NFTPreview
                                tokenid={x.token}
                                to={x.to}
                                from={x.from}
                                key={`preview${x.time}${x.token}`}
                                event={{
                                    type: x.operation as CAPEvent['type'],
                                    timestamp: x.time
                                }}
                                price={x.price}
                            />)
                        : <>None yet!</>}
                    </ScrollRow>
                </div>
                <div className={Styles.collections}>
                    <h2>Explore Listings</h2>
                    <CollectionCardList />
                </div>
            </div>
        </Container>
        <Footer />
    </>
};
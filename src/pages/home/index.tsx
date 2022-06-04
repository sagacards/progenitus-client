import React from 'react';
import { Link } from 'react-router-dom';

import useStore from 'stores/index';
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
import { sortListings, useAllLegendListings } from 'apis/listings';
import { CAPEvent, useProvenance } from 'apis/cap';
import { useTarotDAB } from 'apis/dab';

interface Props { };

export default function HomePage() {
    const { connected } = useStore();
    const listings = useAllLegendListings();
    const { events } = useProvenance('nges7-giaaa-aaaaj-qaiya-cai')

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

    const recent = React.useMemo(() => events?.sort((a, b) => b.time.getTime() - a.time.getTime()), [events]);
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
                        {/* This padding gives space for lineage tooltips. */}
                        {recent ? recent.slice(0, 12).map(x => <div style={{ paddingTop: '24px ' }} key={`recent-${x.time}${x.token}`}>
                            <NFTPreview
                                tokenid={x.token}
                                to={x.to}
                                from={x.from}
                                key={`preview${x.time}${x.token}`}
                                event={{
                                    type: x.operation as CAPEvent['type'],
                                    timestamp: x.time
                                }}
                                price={x.price}
                            />
                        </div>) : <>None yet!</>}
                    </ScrollRow>
                </div>
                <div className={Styles.collections}>
                    <h2>Explore Listings</h2>
                    <Grid>
                        {listings ? <More>
                            {sortListings(listings).map(x => <NFTPreview
                                tokenid={x.token}
                                key={`preview${x.token}`}
                                listing={x}
                            />)}
                        </More> : <>None yet!</>}
                    </Grid>
                </div>
            </div>
        </Container>
        <Footer />
    </>
};
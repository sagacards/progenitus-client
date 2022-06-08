import React from 'react';
import { Link } from 'react-router-dom';

import useStore from 'stores/index';
import { TarotDeckData } from 'api/cards';

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
import { sortListings, useAllLegendListings } from 'api/listings';
import { CAPEvent, useAllProvenance } from 'api/cap';
import { ArcanaArt } from 'api/cards/cards';
import Page from 'pages/wrapper';
import { useDirectory } from 'api/dab';


export default function HomePage() {
    const { connected } = useStore();
    const listings = useAllLegendListings();
    const events = useAllProvenance();
    const { data: dab } = useDirectory();

    const cards = React.useMemo(() => {
        const cards = Array(22).fill(undefined).map((x, i) => ({
            title: TarotDeckData[i].name,
            flavour: TarotDeckData[i].keywords.slice(0, 3).join(', '),
            image: ArcanaArt[i],
            featured: false,
            canister: dab?.find(x => x.name === TarotDeckData[i].name)?.principal
        }));
        cards[0].featured = true;
        return cards;
    }, []);

    const recent = React.useMemo(() => events?.sort((a, b) => b.time.getTime() - a.time.getTime()), [events]);
    return <Page key="HomePage">
        <Navbar />
        <Container>
            <div className={Styles.root}>
                <ScrollRow>
                    {/* This padding gives space for hover effects. */}
                    {cards.map((card, i) => <div style={{ paddingTop: '24px ' }} key={`card-${card.title}`}>
                        <LegendPreview {...card} />
                    </div>)}
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
                    <ScrollRow>
                        <CollectionCardList />
                    </ScrollRow>
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
    </Page>
};
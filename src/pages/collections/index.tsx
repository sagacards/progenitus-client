import Styles from './styles.module.css'
import React from 'react';
import Navbar from 'ui/navbar';
import Footer from 'ui/footer';
import Container from 'ui/container';
import { useParams } from 'react-router-dom';
import { CAPEvent, useProvenance } from 'api/cap';
import { useDirectory } from 'api/dab';
import CollectionTop from 'ui/collections/top';
import { useDescriptionMarkdown } from 'api/legends';
import Grid from 'ui/grid';
import { sortListings, useCanisterListings } from 'api/listings';
import More from 'ui/more';
import NFTPreview from 'ui/nft-preview';
import Tabs from 'ui/tabs';
import Page from 'pages/wrapper';
import { useOpenEvent } from 'api/minting';

interface Props { };

export default function CollectionsPage(props: Props) {
    const { canister } = useParams();
    const { events: provenance } = useProvenance(canister as string);
    const mintingEvent = useOpenEvent(canister as string);
    const { data: directory } = useDirectory();
    const { data: description } = useDescriptionMarkdown(canister as string)
    const { listings } = useCanisterListings(canister as string);
    const collection = React.useMemo(() => canister ? directory?.find(x => x.principal === canister) : undefined, [canister, directory]);
    return <Page key="CollectionsPage">
        <Navbar />
        <Container>
            <div className={Styles.root}>
                <CollectionTop
                    banner={collection?.bannerImage}
                    thumbnail={collection?.thumbnail}
                    name={collection?.name}
                    address={collection?.principal}
                    description={description}
                />
                {mintingEvent && <>
                    <h2>Mint</h2>
                    <div>{mintingEvent.data?.supply} available to mint</div>
                </>}
                <Tabs
                    tabs={[
                        ['Items', <>
                            <Grid>
                                {listings ? <More>
                                    {sortListings(listings).map(x => <NFTPreview
                                        tokenid={x.token}
                                        key={`preview${x.token}`}
                                        listing={x}
                                    />)}
                                </More> : <>None yet!</>}
                            </Grid>
                        </>],
                        ['Activity', <>
                            <Grid>

                            </Grid>
                        </>],
                    ]}
                />
            </div>
        </Container>
        <Footer />
    </Page>
};
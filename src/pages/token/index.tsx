import Styles from './styles.module.css'
import React from 'react';
import Container from 'ui/container';
import Navbar from 'ui/navbar';
import Page from 'pages/wrapper';
import Lineage from 'ui/lineage';
import { Link, useParams } from 'react-router-dom';
import { decodeTokenIdentifier, encodeTokenIdentifier } from 'ictool';
import { useDirectory } from 'api/dab';
import { priceConvertDisplay, priceDisplay, priceFloat, useCanisterListings } from 'api/listings';
import ICP from 'assets/currency/icp.png';
import useStore from 'stores/index';
import Button from 'ui/button';
import Like from 'ui/like';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useBackNext } from './hooks';
import { useTraits } from 'api/legends';
import { Trait, Traits } from 'ui/trait';

interface Props { };

export default function TokenPage(props: Props) {
    const { identifier } = useParams();
    const { icpToUSD } = useStore();
    const { index, canister } = React.useMemo(() => decodeTokenIdentifier(identifier as string), [identifier]);
    const { back, next } = useBackNext(canister, index)
    const { data: directory } = useDirectory();
    const { listings } = useCanisterListings(canister as string);
    const traits = useTraits(canister, index);
    const listing = React.useMemo(() => listings?.find(x => x.token === identifier), [listings, identifier]);
    const collection = React.useMemo(() => canister ? directory?.find(x => x.principal === canister) : undefined, [canister, directory]);
    return <Page key={`TokenPage-${identifier}`}>
        <Navbar />
        <Container>
            <div className={Styles.root}>
                <div className={Styles.stage}>
                    <iframe className={Styles.feature} src={`https://${canister}.raw.ic0.app/${index}`} />
                    <div className={Styles.featurettes}>
                        <img src={`https://${canister}.raw.ic0.app/${index}.webp`} className={Styles.featurette} />
                        <video autoPlay loop src={`https://${canister}.raw.ic0.app/${index}.webm`} className={Styles.featurette} />
                        <div className={Styles.info}>
                            <div className={Styles.widgets}>
                                <Lineage size='lg' operation='listing' collection={collection} />
                                <div className={Styles.widgetsGroup}>
                                    <Like size='lg' outline token={identifier as string} />
                                    <div className={Styles.nav}>
                                        {back !== undefined && <Link to={`/token/${back}`}><Button flush><FaArrowLeft /></Button></Link>}
                                        {next !== undefined && <Link to={`/token/${next}`}><Button flush><FaArrowRight /></Button></Link>}
                                    </div>
                                </div>
                            </div>
                            <h2>{collection?.name} #{index}</h2>
                            {traits && <Traits>
                                {Object.entries(traits).filter(x => x[1] !== undefined).map(([trait, value]) => <div>
                                    <Trait label={trait} value={value[0]} rarity={value[1]} />
                                </div>)}
                            </Traits>}
                            <div className={Styles.buy}>
                                <div className={Styles.label}>Market Listing</div>
                                {listing ? <>
                                    <div className={Styles.price}>
                                        <img src={ICP} height='30' width='30' />
                                        {priceDisplay(listing.price)}
                                        {icpToUSD && <div className={Styles.usd}>{priceConvertDisplay(listing.price, icpToUSD)}</div>}
                                    </div>
                                    <Button size='large'>Buy</Button>
                                </> : <>
                                    This token is not currently listed for sale.
                                </>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    </Page>
};
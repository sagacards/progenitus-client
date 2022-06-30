import Styles from './styles.module.css'
import React from 'react';
import Container from 'ui/container';
import Navbar from 'ui/navbar';
import Page, { NotFound } from 'pages/wrapper';
import Lineage from 'ui/lineage';
import { Link, useParams } from 'react-router-dom';
import { decodeTokenIdentifier, principalToAddress } from 'ictool';
import { useDirectory } from 'api/dab';
import { priceConvertDisplay, priceDisplay, useCanisterListings } from 'api/listings';
import ICP from 'assets/currency/icp.png';
import useStore from 'stores/index';
import Button from 'ui/button';
import Like from 'ui/like';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useBackNext } from './hooks';
import { useTraits } from 'api/legends';
import { Trait, Traits } from 'ui/trait';
import AssetPreload from 'ui/asset-preload';
import { useOwner } from 'api/ext';
import MarketListForm from 'src/forms/market-list';
import useModalStore from 'ui/modal/store';
import MarketBuyForm from 'src/forms/market-buy';
import Grid from 'ui/grid';
import More from 'ui/more';
import Activity from 'ui/activity';
import { useTokenProvenance } from 'api/cap';
import Tabs from 'ui/tabs';

interface Props { };

export default function TokenPage(props: Props) {
    const { identifier } = useParams();

    const { icpToUSD, principal } = useStore();
    const { open } = useModalStore();

    const { index, canister } = React.useMemo(() => decodeTokenIdentifier(identifier as string), [identifier]);
    const { back, next } = useBackNext(canister, index)
    const { data: directory } = useDirectory();
    const { listings } = useCanisterListings(canister as string);
    const { data: owner, status: ownerStatus } = useOwner(identifier as string);
    const traits = useTraits(canister, index);
    const { events: provenance } = useTokenProvenance(identifier as string);

    const listing = React.useMemo(() => listings?.find(x => x.token === identifier), [listings, identifier]);
    const collection = React.useMemo(() => canister ? directory?.find(x => x.principal === canister) : undefined, [canister, directory]);

    const owned = React.useMemo(() => principal && principalToAddress(principal) === owner, [principal, owner]);

    if (directory?.length && !collection) {
        return <NotFound />
    }

    return <Page key={`TokenPage-${identifier}`}>
        <Navbar />
        <Container>
            <div className={Styles.root}>
                <div className={Styles.stage}>
                    <AssetPreload
                        type='iframe'
                        className={Styles.feature}
                        uri={`https://${canister}.raw.ic0.app/${index}`}
                        asset={<iframe src={`https://${canister}.raw.ic0.app/${index}`} />}
                    />
                    <div className={Styles.featurettes}>
                        <AssetPreload
                            type='image'
                            className={Styles.featurette}
                            uri={`https://${canister}.raw.ic0.app/${index}.webp`}
                            asset={<img src={`https://${canister}.raw.ic0.app/${index}.webp`} />}
                        />
                        <AssetPreload
                            type='video'
                            className={Styles.featurette}
                            uri={`https://${canister}.raw.ic0.app/${index}.webm`}
                            asset={<video autoPlay loop src={`https://${canister}.raw.ic0.app/${index}.webm`} />}
                        />
                        <div className={Styles.info}>
                            <div className={Styles.widgets}>
                                <Lineage size='lg' operation='none' collection={collection} from={owner} />
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
                                {Object.entries(traits).filter(x => x[1] !== undefined).map(([trait, value]) => <Trait
                                    key={`trait-${value[0]}`}
                                    label={trait}
                                    value={value[0]}
                                    rarity={value[1]}
                                />)}
                            </Traits>}
                            <div className={Styles.buy}>
                                <div className={Styles.label}>Market Listing</div>
                                {ownerStatus === 'error' ? <>
                                    This token has not been minted yet.
                                </> :
                                    listing ? <>
                                        <div className={Styles.price}>
                                            <img src={ICP} height='30' width='30' />
                                            {priceDisplay(listing.price)}
                                            {icpToUSD && <div className={Styles.usd}>{priceConvertDisplay(listing.price, icpToUSD)}</div>}
                                        </div>
                                        <Button
                                            size='large'
                                            onClick={() => open(
                                                `Purchase "${collection?.name} #${index}"`,
                                                <MarketBuyForm token={identifier as string} />,
                                            )}>Buy</Button>
                                    </> : <>
                                        This token is not currently listed for sale.
                                    </>}
                                {owned && <Button
                                    onClick={() => open(
                                        `Manage "${collection?.name} #${index}" Listing`,
                                        <MarketListForm token={identifier as string} />
                                    )}
                                >Manage Listing</Button>}
                            </div>
                        </div>
                    </div>
                </div>
                <Tabs tabs={[
                    [`Activity (${provenance?.length})`,
                    <Grid>
                        {provenance ? <More interval={9}>
                            {provenance.map(x => <Activity key={`activity${x.token}${x.time.toMillis()}`} event={x} title={false} />)}
                        </More> : <>None yet!</>}
                    </Grid>]
                ]} />
            </div>
        </Container>
    </Page>
};
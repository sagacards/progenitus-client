import Styles from './styles.module.css'
import React from 'react';
import Navbar from 'ui/navbar';
import Footer from 'ui/footer';
import Container from 'ui/container';

import { Link, Navigate, useParams } from 'react-router-dom';
import useStore from 'stores/index';
import Tabs from 'ui/tabs';
import Grid from 'ui/grid';
import NFTPreview from 'ui/nft-preview';
import More from 'ui/more';
import Button from 'ui/button';
import Revealer from 'ui/revealer';
import { eventIsMintable } from 'src/logic/minting';
import Spinner from 'ui/spinner';
import Timer from 'ui/timer';

interface Props {};

export default function DropDetailPage (props : Props) {
    const { id } = useParams();
    const { connecting, connected, history, getEvent, pushMessage } = useStore();
    const event = React.useMemo(() => id ? getEvent(parseInt(id)) : undefined, []);
    const supplyRemaining = event?.supply;
    const allowlistSpots = undefined;
    const balance = { e8s : 100_00_000_000 };
    const [timerSentinel, setTimerSentinel] = React.useState(0);

    const mintable = React.useMemo(() => eventIsMintable(event, supplyRemaining, !connecting && connected, balance, allowlistSpots), [event, supplyRemaining, balance, allowlistSpots, timerSentinel]);

    const MintableMessage = React.useMemo(() => {
        const messages = {
            'loading': () => <Spinner size='small' />,
            'not-connected': () => <><Link to="/connect" state={{referrer : window.location.pathname}}>Connect</Link> your wallet to mint</>,
            'no-access': () => <>Your wallet is not on the allow list</>,
            'insufficient-funds': () => <>Your wallet is not on the allow list</>,
            'not-started': (p : {time : Date}) => <>Starts in <Timer time={p.time} /></>,
            'ended': () => <>Event ended!</>,
            'no-supply': () => <></>,
            'mintable': (p : {end : Date}) => <>Your wallet will be charged. Ends <Timer time={p.end} /></>,
        };
        return messages[mintable];
    }, [mintable]);

    // Rerender on intervals if a timer is ongoing 😵.
    const [timer, setTimer] = React.useState<number>();
    React.useEffect(() => {
        if (mintable == 'not-started' || mintable == 'mintable') {
            if (timer === undefined) {
                setTimer(setInterval(() => {
                    setTimerSentinel(prev => prev + 1);
                }, 1000));
            }
        } else if (timer !== undefined) {
            clearInterval(timer);
            setTimer(undefined);
        };
        return () => {
            clearInterval(timer);
            setTimer(undefined);
        }
    }, [mintable]);
    
    // Push a not found message if event isn't found.
    React.useEffect(() => {
        if (!event) {
            pushMessage({
                type: 'error',
                message: 'Could not find that event.'
            });
        }
    }, [event]);

    // Redirect home if event not found.
    if (!event) return <Navigate to="/" />;

    const collection = event.collection;
    
    return <>
        <Navbar />
        <Container>
            <div className={Styles.root}>
                <div className={Styles.top}>
                    <img className={Styles.banner} src={collection.banner} />
                    <img className={Styles.collection} src={collection.icon} />
                </div>
                <div className={Styles.name}>{collection.name}</div>
                <div className={Styles.stats}>
                    <div className={Styles.stat}>
                        <div className={Styles.statLabel}>Supply</div>
                        <div className={Styles.statValue}>{event.supply}</div>
                    </div>
                    <div className={Styles.stat}>
                        <div className={Styles.statLabel}>Remaining</div>
                        <div className={Styles.statValue}>{supplyRemaining}</div>
                    </div>
                    <div className={Styles.stat}>
                        <div className={Styles.statLabel}>Price</div>
                        <div className={Styles.statValue}>{event.price.e8s / 10 ** 8} ICP</div>
                    </div>
                    <div className={Styles.stat}>
                        <div className={Styles.statLabel}>Access</div>
                        <div className={Styles.statValue}>{event.access}</div>
                    </div>
                    <div className={Styles.stat}>
                        <div className={Styles.statLabel}>Allowlist</div>
                        <div className={Styles.statValue}>
                            {
                                allowlistSpots
                                ? allowlistSpots !== 0
                                    ? <>{allowlistSpots} Mints</>
                                    : <>No Access</>
                                : <>∞ Mints</>
                            }
                        </div>
                    </div>
                </div>
                {collection.description && <div className={Styles.description}><Revealer content={collection.description} /></div>}
                <div className={Styles.mintingStage}>
                    <div className={Styles.stage}>

                    </div>
                    <div className={Styles.button}>
                        <Button size='large' disabled={mintable !== 'mintable'}>Mint {mintable === 'mintable' ? 'Now' : 'Unavailable'}</Button>
                    </div>
                    <div className={Styles.message}><MintableMessage time={event.startDate} end={event.endDate} /></div>
                </div>
                <div className={Styles.activity}>
                    <Tabs
                        tabs={[
                            ['Mints', <>
                                <div style={{ display: 'flex', gap: '10px', padding: '10px'}}><Button size='small'>All</Button> <Button size='small'>Mine</Button></div>
                                <Grid>
                                    <More>{Object.values(history)[0].map(x => <NFTPreview key={`preview${x.token.canister}${x.token.index}`} token={x.token} listing={x.listing} event={x.event} />)}</More>
                                </Grid>
                            </>],
                            ['Transfers', <>Transfers...</>],
                        ]}
                    />
                </div>
            </div>
        </Container>
        <Footer />
    </>;
};
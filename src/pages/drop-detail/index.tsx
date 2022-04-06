import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import useStore from 'stores/index';
import { eventIsMintable, mint } from 'src/logic/minting';
import Navbar from 'ui/navbar';
import Footer from 'ui/footer';
import Container from 'ui/container';
import Tabs from 'ui/tabs';
import Grid from 'ui/grid';
import NFTPreview from 'ui/nft-preview';
import More from 'ui/more';
import Button from 'ui/button';
import Revealer from 'ui/revealer';
import Spinner from 'ui/spinner';
import Timer from 'ui/timer';
import MintScene from 'src/three/mint-scene';
import Styles from './styles.module.css'
import Banner from 'assets/events/0/banner.jpg'

interface Props {};

export default function DropDetailPage (props : Props) {
    const { canister, index } = useParams();
    const { actor, connecting, connected, history, getEvent, pushMessage, balance, fetchSupply, eventSupply, isMinting, setIsMinting, setMintResult, mintResult } = useStore();
    const event = React.useMemo(() => (canister && index) ? getEvent(canister, Number(index)) : undefined, []);
    const allowlistSpots = undefined;
    const [timerSentinel, setTimerSentinel] = React.useState(0);
    const [error, setError] = React.useState<string>();

    const supplyRemaining = React.useMemo(() => {
        if (!canister || !index) return;
        return eventSupply?.[canister]?.[Number(index)];
    }, [eventSupply, canister, index]);

    const mintable = React.useMemo(() => eventIsMintable(event, supplyRemaining, !connecting && connected, balance, allowlistSpots, isMinting), [event, supplyRemaining, balance, allowlistSpots, timerSentinel, isMinting]);

    const MintableMessage = React.useMemo(() => {
        const messages = {
            'loading': () => <Spinner size='small' />,
            'not-connected': () => <><Link to="/connect" state={{referrer : window.location.pathname}}>Connect</Link> your wallet to mint</>,
            'no-access': () => <>Your wallet is not on the allow list</>,
            'insufficient-funds': () => <>Insufficient funds <Link to="/account">deposit</Link></>,
            'not-started': (p : {time : Date}) => <>Starts in <Timer time={p.time} /></>,
            'ended': () => <>Event ended!</>,
            'no-supply': () => <>Sold out</>,
            'mintable': (p : {end : Date}) => <>Your wallet will be charged. Ends <Timer time={p.end} /></>,
            'minting': () => <>Minting...</>,
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
        if (!event || !canister || !index) {
            pushMessage({
                type: 'error',
                message: 'Could not find that event.'
            });
        }
    }, [event]);

    React.useEffect(() => {
        if (!canister || !index) return;
        fetchSupply(canister, Number(index));
    }, [canister, index]);

    const handleMint = React.useMemo(() => function () {
        setError(undefined);
        setIsMinting(true);
        setMintResult(undefined);
        mint(event, supplyRemaining, connected, balance, allowlistSpots, actor, Number(index))
        ?.then(r => {
            console.log(r);
            alert('Mint success!');
        })
        .catch(r => {
            console.error(r);
            setError('Mint failure!');
            alert('Mint failure!');
        })
        .finally(() => setIsMinting(false));
    }, [event, supplyRemaining, connected, balance, allowlistSpots, actor, index]);

    // Redirect home if event not found.
    if (!event || !canister || !index) return <Navigate to="/" />;

    const collection = event.collection;
    
    return <>
        <Navbar />
        <Container>
            <div className={Styles.root}>
                <div className={Styles.top}>
                    <img className={Styles.banner} src={Banner} />
                    <img className={Styles.collection} src={collection.icon} />
                </div>
                <div className={Styles.name}>{collection.name}</div>
                <div className={Styles.stats}>
                    <div className={Styles.stat}>
                        <div className={Styles.statLabel}>Supply</div>
                        <div className={Styles.statValue}>{event.supply}</div>
                    </div>
                    <div className={Styles.stat}>
                        <div className={Styles.statLabel}>For Sale</div>
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
                {new Date().getTime() < event.startDate.getTime() && <div className={Styles.timer}>Starts <Timer time={event.startDate} /></div>}
                {new Date().getTime() <= event.endDate.getTime() && supplyRemaining !== 0 && <div className={Styles.timer}>Ends <Timer time={event.endDate} /></div>}
                {collection.description && <div className={Styles.description}><Revealer content={collection.description} /></div>}
                <div className={Styles.mintingStage}>
                    <div className={[Styles.stage, isMinting ? Styles.minting : ''].join(' ')}>
                        <MintScene />
                    </div>
                    <div className={Styles.button}>
                        <Button
                            size='large'
                            disabled={mintable !== 'mintable'}
                            children={mintable === 'minting' ? <Spinner size='small' /> : <>Mint {mintable === 'mintable' ? mintResult !== undefined ? 'Another' : 'Now' : 'Unavailable'}</>}
                            onClick={handleMint}
                            error={error}
                        />
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
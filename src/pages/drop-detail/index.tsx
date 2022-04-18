import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import useStore, { CAPEvent, ic } from 'stores/index';
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
import { FiExternalLink } from 'react-icons/fi';
import { useTokenStore } from 'stores/tokens';
import { Principal } from '@dfinity/principal';

interface Props {};

export default function DropDetailPage (props : Props) {
    const { canister, index } = useParams();
    const { actor, connecting, connected, getEvent, eventsLastFetch, fetchEvents, pushMessage, balance, fetchSupply, eventSupply, isMinting, setIsMinting, setMintResult, mintResult } = useStore();
    const eventsAreFresh = React.useMemo(() => new Date().getTime() - (eventsLastFetch?.getTime() || 0) < 60_000, [eventsLastFetch])
    const event = React.useMemo(() => (canister && index) ? getEvent(canister, Number(index)) : undefined, [eventsAreFresh]);
    const fetching = React.useMemo(() => !event && !eventsAreFresh, [event, eventsAreFresh]);
    const allowlistSpots = undefined;
    const [timerSentinel, setTimerSentinel] = React.useState(0);
    const [error, setError] = React.useState<string>();
    const [description, setDescription] = React.useState<string>();

    // Fetch description markdown
    React.useEffect(() => {
        if (!event || !event.collection.description) return;
        fetch(event.collection.description)
        .then(r => r.text())
        .then(setDescription);
    }, [event]);

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
                }, 1000) as unknown as number);
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
    
    // Attempt to retrieve the relevant event
    React.useEffect(() => {
        if (!eventsAreFresh) {
            fetchEvents();
        } else if (!event) {
            // Push a not found message if event isn't found.
            pushMessage({
                type: 'error',
                message: 'Could not find that event.'
            });
        };
    }, [event, eventsAreFresh]);

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
            // @ts-ignore: result types...
            if (r?.ok) {
                // @ts-ignore: result types...
                setMintResult(Number(r.ok));
                alert('Mint success!');
            } else {
                setError('Mint failure!');
                alert('Mint failure!');
            }
        })
        .catch(r => {
            console.error(r);
            setError('Mint failure!');
            alert('Mint failure!');
        })
        .finally(() => setIsMinting(false));
    }, [event, supplyRemaining, connected, balance, allowlistSpots, actor, index]);

    const { cap : { [canister as string] : transactions }, capPoll, filtersSet, capRoots } = useTokenStore();
    React.useEffect(() => {
        if (!canister) return;
        filtersSet([Principal.fromText(canister)]);
        capPoll(canister);
    }, [canister, capRoots]);

    // Redirect home if event not found.
    if (!event && eventsAreFresh || !canister) return <Navigate to="/" />;

    const collection = event?.collection;
    
    return <>
        <Navbar />
        <Container>
            <div className={[Styles.root, fetching ? Styles.fetching : ''].join(' ')}>
                <div className={Styles.top}>
                    <img className={Styles.banner} src={collection?.banner} />
                    <img className={Styles.collection} src={collection?.icon} />
                </div>
                <div className={Styles.name}>{collection?.name}</div>
                <div className={Styles.stats}>
                    <div className={Styles.stat}>
                        <div className={Styles.statLabel}>Supply</div>
                        <div className={Styles.statValue}>{event?.supply}</div>
                    </div>
                    <div className={Styles.stat}>
                        <div className={Styles.statLabel}>For Sale</div>
                        <div className={Styles.statValue}>{supplyRemaining}</div>
                    </div>
                    <div className={Styles.stat}>
                        <div className={Styles.statLabel}>Price</div>
                        <div className={Styles.statValue}>{event && event.price.e8s / 10 ** 8} ICP</div>
                    </div>
                    <div className={Styles.stat}>
                        <div className={Styles.statLabel}>Access</div>
                        <div className={Styles.statValue}>{event?.access}</div>
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
                {event && new Date().getTime() < event.startDate.getTime() ? <div className={Styles.timer}>Starts <Timer time={event.startDate} /></div> : event && new Date().getTime() <= event.endDate.getTime() && supplyRemaining !== 0 && <div className={Styles.timer}>Ends <Timer time={event.endDate} /></div>}
                {description && <div className={Styles.description}><Revealer content={description} /></div>}
                <div className={[Styles.mintingStage, mintResult ? Styles.minted : ''].join(' ')}>
                    <div className={[Styles.stage, isMinting ? Styles.minting : ''].join(' ')}>
                        <a href={`${ic.protocol}://${canister}.raw.${ic.host}/${mintResult}`} target="_blank" className={Styles.externalLink}>
                            <Button>
                                <FiExternalLink />
                            </Button>
                        </a>
                        <MintScene canister={canister} />
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
                    <div className={Styles.message}>{event && <MintableMessage time={event.startDate} end={event.endDate} />}</div>
                </div>
                <div className={Styles.activity}>
                    <Tabs
                        tabs={[
                            ['Mints', <>
                                <div style={{ display: 'flex', gap: '10px', padding: '10px'}}>
                                    <Button size='small'>All</Button>
                                    <Button size='small'>Mine</Button>
                                </div>
                                <Grid>
                                    {transactions ? <More>
                                        {transactions.map(x => <NFTPreview
                                            key={`preview${x.token}`}
                                            token={{
                                                index: 0,
                                                canister: '',
                                            }}
                                            event={{
                                                type: x.operation as CAPEvent['type'],
                                                timestamp: x.time
                                            }}
                                        />)}
                                    </More> : <>None yet!</>}
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
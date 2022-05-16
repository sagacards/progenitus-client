import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import useStore, { CAPEvent, ic } from 'stores/index';
import { eventIsMintable, eventIsTimeGated, mint } from 'src/logic/minting';
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
import { principalToAddress } from 'ictool';
import useModalStore from 'ui/modal/store';
import Copyable from 'ui/copyable';
import { DateTime } from 'luxon';
import Swap from 'ui/swap';

interface Props {};

export default function DropDetailPage (props : Props) {
    const { canister, index } = useParams();
    const { actor, principal, connecting, connected, getEvent, eventsLastFetch, fetchEvents, pushMessage, balance, fetchSupply, eventSupply, isMinting, setIsMinting, setMintResult, mintResult, fetchBalance, wallet } = useStore();
    const { cap : { [canister as string] : transactions }, capPoll, filtersSet, capRoots } = useTokenStore();
    const { open } = useModalStore();

    const eventsAreFresh = React.useMemo(() => new Date().getTime() - (eventsLastFetch?.getTime() || 0) < 60_000, [eventsLastFetch])
    const event = React.useMemo(() => (canister && index) ? getEvent(canister, Number(index)) : undefined, [eventsAreFresh]);
    const fetching = React.useMemo(() => !event && !eventsAreFresh, [event, eventsAreFresh]);
    const timeGated = React.useMemo(() => eventIsTimeGated(event), []);
    
    const [timerSentinel, setTimerSentinel] = React.useState(0);
    const [error, setError] = React.useState<string>();
    const [description, setDescription] = React.useState<string>();
    const [spots, setSpots] = React.useState<number>();
    const [spotsLoading, setSpotsLoading] = React.useState<boolean>(false);
    const [supply, setSupply] = React.useState<number>();
    const [mine, setMine] = React.useState<boolean>(false);

    const remainingInterval = React.useRef<number>();


    // Fetch spots
    React.useEffect(() => {
        if (!actor || !canister || !index) return;
        setSpotsLoading(true)
        actor?.getAllowlistSpots(Principal.fromText(canister), BigInt(index))
        .then(r => {
            if ('ok' in r) {
                setSpots(Number(r.ok))
            } else {
                console.error(r);
            }
        })
        .finally(() => setSpotsLoading(false));
    }, [mintResult, actor, canister, index]);

    // Fetch supply
    React.useEffect(() => {
        fetch(`https://${canister}.raw.ic0.app/supply`)
        .then(r => r.text())
        .then(r => setSupply(Number(r)));
    }, []);

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

    const mintable = React.useMemo(() => eventIsMintable(event, supplyRemaining, !connecting && connected, balance, spots, isMinting), [event, supplyRemaining, balance, spots, timerSentinel, isMinting]);

    const MintableMessage = React.useMemo(() => {
        const messages = {
            'loading': () => <Spinner size='small' />,
            'not-connected': () => <><Link to="/connect" state={{referrer : window.location.pathname}}>Connect</Link> your wallet to mint</>,
            'no-access': () => <>Your wallet is not on the allow list</>,
            'insufficient-funds': () => <>Insufficient funds in mint account <a onClick={() => open('Deposit Minting Funds', <SwapModal />)}>deposit from wallet</a></>,
            'not-started': (p : {time : DateTime}) => <>Starts in <Timer time={p.time} /></>,
            'ended': () => <>Event ended!</>,
            'no-supply': () => <>Sold out</>,
            'mintable': (p : {end : DateTime}) => <>Your wallet will be charged.{timeGated && <>Ends <Timer time={p.end} /></>}</>,
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
        remainingInterval.current = setInterval(() => fetchSupply(canister, Number(index)), 5000) as unknown as number;
        return () => clearInterval(remainingInterval.current);
    }, [canister, index]);

    const handleMint = React.useMemo(() => function () {
        if (canister && wallet === 'stoic' && !window.localStorage.getItem(`stoicwarning${canister}`)) {
            window.localStorage.setItem(`stoicwarning${canister}`, 'true');
            open('Notice For Stoic Wallet Users', <StoicWarning canister={canister} />);
        };
        setError(undefined);
        setIsMinting(true);
        setMintResult(undefined);
        mint(event, supplyRemaining, connected, balance, spots, actor, Number(index))
        ?.then(r => {
            if (r && 'ok' in r) {
                setMintResult(Number(r.ok));
                alert('Mint success!');
                fetchBalance();
            } else {
                console.error(r)
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
    }, [event, supplyRemaining, connected, balance, spots, actor, index]);

    React.useEffect(() => {
        if (!canister) return;
        filtersSet([Principal.fromText(canister)]);
        capPoll(canister);
    }, [canister, capRoots]);

    // Redirect home if event not found.
    if (!event && eventsAreFresh || !canister) return <Navigate to="/" />;

    const collection = event?.collection;

    const mints = React.useMemo(() => transactions?.filter(x => {
        if (x.operation !== 'mint') return false;
        if (mine) {
            if (!principal) return false;
            if (principalToAddress(principal) !== x.to) return false
        };
        return true;
    }), [transactions, mine, principal]);

    const transfers = React.useMemo(() => transactions?.filter(x => {
        if (!['transfer', 'sale'].includes(x.operation)) return false;
        return true;
    }), [transactions, principal]);
    
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
                        <div className={Styles.statValue}>{supply}</div>
                    </div>
                    <div className={Styles.stat}>
                        <div className={Styles.statLabel}>Unminted</div>
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
                                spotsLoading
                                    ? <Spinner size='small' />
                                    : connected
                                        ? spots
                                            ? spots !== -1
                                                ? <>{spots} Mints</>
                                                : <>∞ Mints</>
                                            : <>No Access</>
                                        : <><Link to="/connect" state={{referrer : window.location.pathname}}>Connect</Link></>
                            }
                        </div>
                    </div>
                </div>
                {event && DateTime.now().toMillis() < event.startDate.toMillis() ? <div className={Styles.timer}>Starts <Timer time={event.startDate} /></div> : event && DateTime.now().toMillis() <= event.endDate.toMillis() && supplyRemaining !== 0 && <div className={Styles.timer}>Ends <Timer time={event.endDate} /></div>}
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
                                    <Button active={!mine} onClick={() => setMine(false)} size='small'>All</Button>
                                    <Button active={mine} onClick={() => setMine(true)} size='small'>Mine</Button>
                                </div>
                                <Grid>
                                    {mints ? <More>
                                        {mints.map(x => <NFTPreview
                                            tokenid={x.token}
                                            minter={x.to}
                                            key={`preview${x.token}`}
                                            event={{
                                                type: x.operation as CAPEvent['type'],
                                                timestamp: x.time
                                            }}
                                        />)}
                                    </More> : <>None yet!</>}
                                </Grid>
                            </>],
                            ['Transfers', <>
                                <Grid>
                                    {transfers ? <More>
                                        {transfers.map(x => <NFTPreview
                                            tokenid={x.token}
                                            minter={x.to}
                                            key={`preview${x.token}`}
                                            event={{
                                                type: x.operation as CAPEvent['type'],
                                                timestamp: x.time
                                            }}
                                        />)}
                                    </More> : <>None yet!</>}
                                </Grid>
                            </>],
                        ]}
                    />
                </div>
            </div>
        </Container>
        <Footer />
    </>;
};

function StoicWarning (props : { canister : string }) {
    const { close } = useModalStore();
    return <>
        <p>You must add this canister to see your new NFT in your stoic wallet.</p>
        <Copyable>{props.canister}</Copyable>
        <Button size='large' onClick={() => close()}>Okay</Button>
    </>
}

function SwapModal () {
    const { close } = useModalStore();
    const { balanceDisplay, walletBalanceDisplay } = useStore();
    return <>
        <Swap />
        <div>
            <small className="t-mono">Mint account: {balanceDisplay() !== undefined ? balanceDisplay()?.toFixed(2) : <Spinner size='small' />} <span className={Styles.icp}>ICP</span> </small>
            <br />
            <small className="t-mono">Wallet: {walletBalanceDisplay() !== undefined ? walletBalanceDisplay()?.toFixed(2) : <Spinner size='small' />} <span className={Styles.icp}>ICP</span> </small>
        </div>
        <a onClick={close}>Done</a>
    </>;
};
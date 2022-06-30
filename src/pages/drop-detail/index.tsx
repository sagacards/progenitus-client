import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { principalToAddress } from 'ictool';
import { DateTime } from 'luxon';

import useStore, { eventIsMintable } from 'stores/index';
import useMessageStore from 'stores/messages';

import Button from 'ui/button';
import Container from 'ui/container';
import Footer from 'ui/footer';
import Grid from 'ui/grid';
import More from 'ui/more';
import Navbar from 'ui/navbar';
import NFTPreview from 'ui/nft-preview';
import Revealer from 'ui/revealer';
import Spinner from 'ui/spinner';
import Tabs from 'ui/tabs';
import Timer from 'ui/timer';

import Styles from './styles.module.css'
import { CAPEvent, useProvenance } from 'api/cap';
import CollectionTop from 'ui/collections/top';
import Page from 'pages/wrapper';
import Mint from 'ui/mint';
import { useDescriptionMarkdown, useSupply } from 'api/legends';
import { useEvent, useEventSupply, useSpots } from 'api/minting';

interface Props { };

export default function DropDetailPage(props: Props) {
    const { canister, index } = useParams();
    const { principal, connecting, connected, getEvent, eventsLastFetch, fetchEvents, balance, fetchSupply, eventSupply, isMinting } = useStore();
    const { pushMessage } = useMessageStore();

    const { events } = useProvenance(canister as string);
    const { data: supply } = useSupply(canister as string);
    const { data: spots, isLoading: spotsLoading } = useSpots(canister as string, Number(index));
    const { data: description } = useDescriptionMarkdown(canister as string);
    const { data: event, isLoading, status } = useEvent(canister as string, Number(index));
    const { data: remaining } = useEventSupply(canister as string, Number(index));

    const [timerSentinel, setTimerSentinel] = React.useState(0);
    const [mine, setMine] = React.useState<boolean>(false);

    const mintable = React.useMemo(() => eventIsMintable(event, remaining, !connecting && connected, balance, spots, isMinting), [event, remaining, balance, spots, timerSentinel, isMinting]);

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

    // Redirect home if event not found.
    if (!event && status === 'error' || !canister) return <Navigate to="/" />;

    const collection = event?.collection;

    const mints = React.useMemo(() => events?.filter(x => {
        if (x.operation !== 'mint') return false;
        if (mine) {
            if (!principal) return false;
            if (principalToAddress(principal) !== x.to) return false
        };
        return true;
    }), [events, mine, principal]);

    const transfers = React.useMemo(() => events?.filter(x => {
        if (!['transfer', 'sale'].includes(x.operation)) return false;
        return true;
    }), [events, principal]);

    return <Page key="DropPage">
        <Navbar />
        <Container>
            <div className={[Styles.root, isLoading ? Styles.fetching : ''].join(' ')}>
                <CollectionTop
                    banner={collection?.banner}
                    thumbnail={collection?.icon}
                    name={collection?.name}
                />
                <div className={Styles.stats}>
                    <div className={Styles.stat}>
                        <div className={Styles.statLabel}>Supply</div>
                        <div className={Styles.statValue}>{supply}</div>
                    </div>
                    <div className={Styles.stat}>
                        <div className={Styles.statLabel}>Unminted</div>
                        <div className={Styles.statValue}>{remaining}</div>
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
                                        : <><Link to="/connect" state={{ referrer: window.location.pathname }}>Connect</Link></>
                            }
                        </div>
                    </div>
                </div>
                {event && DateTime.now().toMillis() < event.startDate.toMillis() ? <div className={Styles.timer}>Starts <Timer time={event.startDate} /></div> : event && DateTime.now().toMillis() <= event.endDate.toMillis() && remaining !== 0 && <div className={Styles.timer}>Ends <Timer time={event.endDate} /></div>}
                {description && <div className={Styles.description}><Revealer content={description} /></div>}
                {event && <Mint canister={canister} event={event} />}
                <div className={Styles.activity}>
                    <Tabs
                        tabs={[
                            ['Mints', <>
                                <div style={{ display: 'flex', gap: '10px', padding: '10px' }}>
                                    <Button active={!mine} onClick={() => setMine(false)} size='small'>All</Button>
                                    <Button active={mine} onClick={() => setMine(true)} size='small'>Mine</Button>
                                </div>
                                <Grid>
                                    {mints ? <More>
                                        {mints.map(x => <NFTPreview
                                            tokenid={x.token}
                                            to={x.to}
                                            key={`preview${x.token}`}
                                            event={{
                                                type: x.operation as CAPEvent['type'],
                                                timestamp: x.time.toJSDate()
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
                                            to={x.to}
                                            key={`preview${x.token}`}
                                            event={{
                                                type: x.operation as CAPEvent['type'],
                                                timestamp: x.time.toJSDate()
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
    </Page>;
};

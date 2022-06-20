import React from 'react'
import { DateTime } from 'luxon';
import { Link } from 'react-router-dom';
import MintScene from 'src/three/mint-scene';
import { FiExternalLink } from 'react-icons/fi';

import useStore, { eventIsMintable, eventIsTimeGated } from 'stores/index';
import Button from 'ui/button';
import Spinner from 'ui/spinner';
import Timer from 'ui/timer';
import Styles from './styles.module.css'
import { mint, MintingEvent, useSpots } from 'api/minting';
import { SwapModal } from 'ui/swap';
import { bazaar, ic } from 'api/actors';
import useModalStore from 'ui/modal/store';
import Copyable from 'ui/copyable';
import { queryClient } from 'src/App';

interface Props {
    children?: React.ReactNode;
    remaining?: number;
    event: MintingEvent;
    canister: string;
}

export default function Mint({ remaining, event, canister }: Props) {
    const { mintResult, isMinting, connecting, connected, balance, wallet, setIsMinting, setMintResult, fetchBalance } = useStore();
    const { open } = useModalStore();
    const { data: spots } = useSpots(canister, event.id);

    const timeGated = React.useMemo(() => eventIsTimeGated(event), []);
    const mintable = React.useMemo(() => eventIsMintable(event, remaining, !connecting && connected, balance, spots, isMinting), [event, remaining, balance, spots, isMinting]);

    const [error, setError] = React.useState<string>();

    // Map mint eligibility states to a user-friendly message.
    const MintableMessage = React.useMemo(() => {
        const messages = {
            'loading': () => <Spinner size='small' />,
            'not-connected': () => <><Link to="/connect" state={{ referrer: window.location.pathname }}>Connect</Link> your wallet to mint</>,
            'no-access': () => <>Your wallet is not on the allow list</>,
            'insufficient-funds': () => <>Insufficient funds in mint account <a onClick={() => open('Deposit Minting Funds', <SwapModal />)}>deposit from wallet</a></>,
            'not-started': (p: { time: DateTime }) => <>Starts in <Timer time={p.time} /></>,
            'ended': () => <>Event ended!</>,
            'no-supply': () => <>Sold out</>,
            'mintable': (p: { end: DateTime }) => <>Your wallet will be charged.{timeGated && <>Ends <Timer time={p.end} /></>}</>,
            'minting': () => <>Minting...</>,
        };
        return messages[mintable];
    }, [mintable]);

    // Action to mint an NFT
    const handleMint = React.useMemo(() => function () {
        if (canister && wallet === 'stoic' && !window.localStorage.getItem(`stoicwarning${canister}`)) {
            window.localStorage.setItem(`stoicwarning${canister}`, 'true');
            open('Notice For Stoic Wallet Users', <StoicWarning canister={canister} />);
        };
        setError(undefined);
        setIsMinting(true);
        setMintResult(undefined);
        mint(event, remaining, connected, balance, spots, bazaar, event.id)
            ?.then(r => {
                if (r && 'ok' in r) {
                    setMintResult(Number(r.ok));
                    queryClient.invalidateQueries([`event-spots-${canister}-${event}`, `event-supply-${canister}-${event}`])
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
    }, [event, remaining, connected, balance, spots, bazaar, event.id]);

    return <div className={[Styles.root, mintResult ? Styles.minted : ''].join(' ')}>
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
                children={mintable === 'minting' ? <Spinner size='small' /> : <>Mint {mintResult !== undefined ? 'Another' : 'Now'}</>}
                onClick={handleMint}
                error={error}
            />
        </div>
        <div className={Styles.message}>{event && <MintableMessage time={event.startDate} end={event.endDate} />}</div>
    </div>
}

function StoicWarning(props: { canister: string }) {
    const { close } = useModalStore();
    return <>
        <p>You must add this canister to see your new NFT in your stoic wallet.</p>
        <Copyable>{props.canister}</Copyable>
        <Button size='large' onClick={() => close()}>Okay</Button>
    </>
}
// Form to purchase an NFT listed on secondary markets.

import { useIcpToUsd } from 'api/cycles';
import { priceDisplay, useMutateListing, useListing, priceConvertDisplay, useMutateLock, useIsLocked } from 'api/listings';
import { useTransfer } from 'api/transfer-icp';
import { decodeTokenIdentifier, principalToAddress } from 'ictool';
import React from 'react'
import { queryClient } from 'src/App';
import useStore from 'stores/index';
import Button from 'ui/button';
import useModalStore from 'ui/modal/store';
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
    token: string;
}

export default function MarketBuyForm(props: Props) {

    const { principal, wallet } = useStore()
    const listing = useListing(props.token);
    const lock = useMutateLock();
    const transferICP = useTransfer();
    const conversion = useIcpToUsd();

    const usd = React.useMemo(() => conversion?.data && listing?.data && priceConvertDisplay(listing.data.price, conversion.data), [listing, conversion])
    const { canister, index } = decodeTokenIdentifier(props.token);
    const { close } = useModalStore();

    const handleBuy = React.useMemo(() => async () => {
        console.log(wallet)
        if (!listing?.data?.price || !principal || !wallet) return;
        const to = await lock.mutateAsync({
            token: props.token,
            price: { e8s: listing.data.price.value },
            buyer: principalToAddress(principal),
        });
        const block = await transferICP.mutateAsync({
            wallet,
            amount: { e8s: listing.data.price.value },
            to
        });
        if (typeof block === 'number') {
            queryClient.invalidateQueries([`bearer-${props.token}`, `listings-${canister}`]);
            alert('🃏🤩 Transfer complete!')
            close();
        };
    }, [listing?.data?.price, principal, wallet]);

    const loading = listing.isLoading || lock.isLoading || transferICP.isLoading || conversion.isLoading;
    const locked = useIsLocked(listing?.data);

    return <div className={Styles.root}>
        <div className={Styles.body}>
            <img
                className={Styles.thumbnail}
                width={200} height={200}
                src={`https://${canister}.raw.ic0.app/${index}.webp`}
            />
            <div className={Styles.content}>
                <div className={Styles.price}>
                    <div className={Styles.status}>
                        Listed for {listing.data?.price && priceDisplay(listing.data?.price)}
                    </div>
                    <div className={Styles.usd}>{usd}</div>
                </div>
                <div className={Styles.actions}>
                    <Button size='large' loading={loading} disabled={loading || locked} onClick={() => handleBuy()}>Buy</Button>
                    {locked && <small>Pending purchase ({listing.data?.locked?.diffNow('seconds').seconds.toFixed(0)}s)</small>}
                </div>
            </div>
        </div>
        <Button onClick={close} size='small'>Done</Button>
    </div>
}
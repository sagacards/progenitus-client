// Form to list an NFT that you own for sale on secondary markets.

import { legend } from 'api/actors';
import { useIcpToUsd } from 'api/cycles';
import { Listing, priceDisplay, useMutateListing, useListing } from 'api/listings';
import { decodeTokenIdentifier } from 'ictool';
import React from 'react'
import Button from 'ui/button';
import useModalStore from 'ui/modal/store';
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
    token: string;
}

type Status = 'listed' | 'unlisted' | 'locked';

export default function MarketListForm(props: Props) {

    const [price, setPrice] = React.useState<string>('')

    const listing = useListing(props.token);
    const manageListing = useMutateListing();
    const conversion = useIcpToUsd();

    const usd = React.useMemo(() => conversion?.data && price && (conversion.data * parseFloat(price)).toFixed(2), [price, conversion])
    const { canister, index } = decodeTokenIdentifier(props.token);
    const { close } = useModalStore();

    const handleList = React.useMemo(() => () => {
        if (!price) return;
        manageListing.mutate({ token: props.token, price: { e8s: parseFloat(price) * 10 ** 8 } });
    }, [price])

    const handleDelist = React.useMemo(() => (e: React.MouseEvent) => {
        e.preventDefault()
        manageListing.mutate({ token: props.token, price: undefined });
    }, [])

    return <div className={Styles.root}>
        <div className={Styles.body}>
            <img
                className={Styles.thumbnail}
                width={200} height={200}
                src={`https://${canister}.raw.ic0.app/${index}.webp`}
            />
            <div className={Styles.content}>
                <div className={Styles.status}>
                    {listing?.data?.listed ? <>
                        Listed for {listing.data?.price && priceDisplay(listing.data?.price)}
                    </> : <>
                        Not listed
                    </>}
                </div>
                <label>
                    Price (ICP)
                    <div className={Styles.input}>
                        <input autoFocus value={price} onChange={(e) => setPrice(e.currentTarget.value)} />
                        <div className={Styles.usd}>
                            ${usd || 0} USD
                        </div>
                    </div>
                </label>
                <div className={Styles.actions}>
                    <Button loading={manageListing.isLoading || listing.isLoading} disabled={!!listing.data?.locked || manageListing.isLoading} onClick={() => handleList()}>{listing?.data?.listed ? 'Update Listing' : 'List'}</Button>
                    {listing?.data?.listed && <a href="#" onClick={handleDelist}><small>Remove listing</small></a>}
                </div>
            </div>
        </div>
        <Button onClick={close} size='small'>Done</Button>
    </div>
}
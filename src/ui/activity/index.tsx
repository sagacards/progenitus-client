import { Transaction } from 'api/cap'
import { useCanisterDetails } from 'api/dab'
import { priceDisplay } from 'api/listings'
import { decodeTokenIdentifier } from 'ictool'
import React from 'react'
import { Link } from 'react-router-dom'
import Hash from 'ui/hash'
import Like from 'ui/like'
import Lineage from 'ui/lineage'
import Styles from './styles.module.css'

interface Props {
    event: Transaction
    title?: boolean;
}

export default function Activity({ event, title = true }: Props) {
    const { canister, index } = React.useMemo(() => decodeTokenIdentifier(event.token), [event.token])
    const collection = useCanisterDetails(canister);
    return <div className={Styles.root}>
        {title && <Link to={`/token/${event.token}`} className="no-fancy"><div className={Styles.title}>{collection?.name} #{index}</div></Link>}
        <div className={Styles.sideBy}>
            <Lineage {...event} collection={collection} />
            <Like token={event.token} />
        </div>
        <div className={Styles.body}>
            {event.operation} to <Hash children={event.to} /> {event.price.value > 0 && `for ${priceDisplay(event.price)}`} on {event.time.toLocaleDateString()}
        </div>
    </div>
}
import React from 'react'
import useStore, { Listing } from 'stores/index'
import Lineage from 'ui/lineage'
import Spinner from 'ui/spinner'
import Styles from './styles.module.css'
import { FaHeart } from 'react-icons/fa'
import dayjs from 'dayjs'
import relativetime from 'dayjs/plugin/relativeTime'
import { Principal } from '@dfinity/principal'
import { decodeTokenIdentifier, principalToAddress } from 'ictool'
import { priceDisplay, priceConvertDisplay } from 'api/listings'
import { CAPEvent, Transaction } from 'api/cap'
import { useDirectory } from 'api/dab'
import { Link } from 'react-router-dom'

dayjs.extend(relativetime);


// TODO: Create an arbitrary metadata structure so that you can pass whatever you want?
interface Props {
    to?: string;
    from?: string;
    tokenid: string;
    listing?: Listing;
    event?: CAPEvent;
    price?: Transaction['price'];
}

export default function NFTPreview(props: Props) {

    // App store.
    const { icpToUSD, like, unlike, likes, doesLike, principal, likeCount, connected } = useStore();

    // Component state
    const [play, setPlay] = React.useState<boolean>(false);
    const [readyStatic, setReadyStatic] = React.useState<boolean>(false);
    const [animated, setAnimated] = React.useState<string>();
    const [count, setCount] = React.useState<number>();

    const token = React.useMemo(() => decodeTokenIdentifier(props.tokenid), []);
    const liked = React.useMemo(() => doesLike(token), [likes]);

    const mine = React.useMemo(() => principal && principalToAddress(principal) === props.to, [principal]);

    React.useEffect(() => void likeCount(token).then(r => setCount(r)), [likes])

    // Lazy load static thumbnails.
    React.useEffect(() => {
        const url = `https://${token.canister}.raw.ic0.app/${token.index}.webp`;
        const img = new Image();
        img.onload = () => setReadyStatic(true);
        img.src = url;
    }, []);

    // Prefetch animated previews.
    function fetchAnimated() {
        if (animated) return;
        const url = `https://${token.canister}.raw.ic0.app/${token.index}.webm`;
        fetch(url).then(r => r.blob().then(b => {
            var reader = new FileReader();
            reader.readAsDataURL(b);
            reader.onloadend = function () {
                setAnimated(url);
            }
        }));
    };

    const handleLike = React.useMemo(() => function () {
        if (!principal) return;
        const update = !liked;
        if (update) {
            like({
                canister: Principal.fromText(token.canister),
                index: token.index,
                user: principal,
            })
        } else {
            unlike({
                canister: Principal.fromText(token.canister),
                index: token.index,
                user: principal,
            })
        };
    }, [likes, principal]);

    const { data: dab } = useDirectory();
    const collection = React.useMemo(() => dab?.find(c => c.principal === token.canister), [dab]);

    return <div className={[Styles.root, mine ? Styles.mine : ''].join(' ')} onMouseEnter={() => { setPlay(true); fetchAnimated(); }} onMouseLeave={() => setPlay(false)}>
        <Lineage to={props.to} from={props.from || props.listing?.seller} collection={collection} operation={props.event?.type || 'listing'} />
        <Link to={`/token/${props.tokenid}`}>
            <div className={Styles.stage}>
                {readyStatic && <img className={Styles.static} src={`https://${token.canister}.raw.ic0.app/${token.index}.webp`} />}
                {animated && <video className={[Styles.animated, play && animated ? Styles.animatedPlay : ''].join(' ')} loop autoPlay muted>
                    <source src={`${animated}`} type="video/webm" />
                </video>}
                <div className={[Styles.loader, readyStatic && play && !animated ? Styles.loaderHover : ''].join(' ')}><Spinner /></div>
            </div>
        </Link>
        <div className={Styles.meta}>
            <div className={Styles.details}>
                <div className={Styles.title}>
                    <div className={Styles.collection}>{collection?.name}</div>
                    <div className={Styles.mint}>#{token.index}</div>
                </div>
                <div className={Styles.like}>
                    <div className={Styles.likeCount}>{count}</div>
                    <div className={[Styles.likeIcon, liked ? Styles.active : '', !connected ? Styles.disabled : ''].join(' ')} onClick={() => handleLike()}><FaHeart /></div>
                </div>
            </div>
            <div className={Styles.divider} />
            <div className={Styles.actions}>
                {props.listing && <div className={Styles.stat}>
                    <div>
                        <div className={Styles.price}>
                            {/* <div className={Styles.priceLabel}>Price</div> */}
                            <div className={Styles.priceAmount}>{priceDisplay(props.listing.price)}</div>
                        </div>
                        {props.listing.price && icpToUSD && <div className={Styles.usd}>{priceConvertDisplay(props.listing.price, icpToUSD)}</div>}
                    </div>
                    <div>For Sale</div>
                </div>}
                {props.event && <div className={Styles.stat}>
                    <div>{dayjs(props.event.timestamp).from(new Date())}</div>
                    <div>
                        {props.event.type}
                        {props.price?.currency && <> {priceDisplay(props.price)}</>}
                    </div>
                </div>}
            </div>
        </div>
    </div>
}

import React from 'react'
import useStore, { CAPEvent, Listing, Token } from 'stores/index'
import Lineage from 'ui/lineage'
import Spinner from 'ui/spinner'
import Styles from './styles.module.css'
import { FaHeart } from 'react-icons/fa'
import dayjs from 'dayjs'
import relativetime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativetime);


// TODO: Create an arbitrary metadata structure so that you can pass whatever you want?
interface Props {
    token : Token;
    listing?: Listing;
    event?  : CAPEvent;
}

export default function NFTPreview (props : Props) {

    // App store.
    const { icpToUSD, collections } = useStore();

    // Component state
    const [play, setPlay] = React.useState<boolean>(false);
    const [readyStatic, setReadyStatic] = React.useState<boolean>(false);
    const [animated, setAnimated] = React.useState<string>();
    const [liked, setLiked] = React.useState(false);
    
    // Lazy load static thumbnails.
    React.useEffect(() => {
        const url = `https://${props.token.canister}.raw.ic0.app/${props.token.index}.webp`;
        const img = new Image();
        img.onload = () => setReadyStatic(true);
        img.src = url;
    }, []);

    // Prefetch animated previews.
    function fetchAnimated () {
        if (animated) return;
        const url = `https://${props.token.canister}.raw.ic0.app/${props.token.index}.webm`;
        fetch(url).then(r => r.blob().then(b => {
            var reader = new FileReader();
            reader.readAsDataURL(b); 
            reader.onloadend = function() {
                setAnimated(url);
            }
        }));
    };

    const collection = collections[props.token.canister];

    return <div className={Styles.root} onMouseEnter={() => { setPlay(true); fetchAnimated(); }} onMouseLeave={() => setPlay(false)}>
        <Lineage />
        <div className={Styles.stage}>
            {readyStatic && <img className={Styles.static} src={`https://${props.token.canister}.raw.ic0.app/${props.token.index}.webp`} />}
            {animated && <video className={[Styles.animated, play && animated ? Styles.animatedPlay : ''].join(' ')} loop autoPlay muted>
                <source src={`${animated}`} type="video/webm" />
            </video>}
            <div className={[Styles.loader, readyStatic && play && !animated ? Styles.loaderHover : ''].join(' ')}><Spinner /></div>
        </div>
        <div className={Styles.meta}>
            <div className={Styles.details}>
                <div className={Styles.title}>
                    <div className={Styles.collection}>{collection?.name}</div>
                    <div className={Styles.mint}>#{props.token.index}</div>
                </div>
                <div className={Styles.like}>
                    <div className={Styles.likeCount}>0</div>
                    <div className={[Styles.likeIcon, liked ? Styles.active : ''].join(' ')} onClick={() => setLiked(!liked)}><FaHeart /></div>
                </div>
            </div>
            <div className={Styles.divider} />
            <div className={Styles.actions}>
                {props.listing && <div>
                    {icpToUSD && <div className={Styles.usd}>${(props.listing.price * icpToUSD).toFixed(2)} USD</div>}
                    <div className={Styles.price}>
                        <div className={Styles.priceLabel}>Price</div>
                        <div className={Styles.priceAmount}>{props.listing.price.toFixed(2)} ICP</div>
                    </div>
                </div>}
                {props.event && <div className={Styles.stat}>
                    <div>{dayjs(props.event.timestamp).from(new Date())}</div>
                    <div>{props.event.type}</div>
                </div>}
            </div>
        </div>
    </div>
}
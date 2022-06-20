import { Principal } from '@dfinity/principal';
import { like, unlike, useIsLiked, useLikeCount } from 'api/likes';
import { decodeTokenIdentifier } from 'ictool';
import React from 'react'
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import useStore from 'stores/index';
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
    token: string;
    size?: 'lg';
    outline?: boolean;
}

export default function Like(props: Props) {
    const { canister, index } = React.useMemo(() => decodeTokenIdentifier(props.token), [props.token])
    const { connected, principal } = useStore()
    const count = useLikeCount(Principal.fromText(canister), index);
    const { isLiked } = useIsLiked(Principal.fromText(canister), index, principal)
    const [active, setActive] = React.useState(false);
    React.useEffect(() => setActive(isLiked), [isLiked]);
    const handleLike = React.useMemo(() => () => {
        if (!connected) return;
        if (active) {
            unlike({ canister, index });
            setActive(false);
        } else {
            like({ canister, index });
            setActive(true);
        };
    }, [active]);
    return <div className={[Styles.root, props.size ? Styles[props.size] : ''].join(' ')}>
        <div className={Styles.likeCount}>{count.count}</div>
        <div className={[Styles.likeIcon, active ? Styles.active : '', !connected ? Styles.disabled : ''].join(' ')} onClick={() => handleLike()}>{props.outline && !active ? <FaRegHeart /> : <FaHeart />}</div>
    </div>
}
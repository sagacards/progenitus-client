// Canister providing likes on NFTs.

import { useQuery, UseQueryOptions } from 'react-query';
import { Principal } from '@dfinity/principal';
import { TokenIndex } from 'canisters/likes/likes.did.d';
import { likes } from './actors';
import { queryClient } from 'src/App';

///////////
// Conf //
/////////

const cache: Partial<
    UseQueryOptions<Like[], unknown, Like[], `likes-${string}`>
> = {
    cacheTime: 60_000 * 60 * 24,
    staleTime: 60_000 * 2,
    refetchInterval: 60_000 * 2,
};

////////////
// Types //
//////////

export interface Token {
    canister: string;
    index: number;
}

export interface Like {
    canister: string;
    index: number;
    user: string;
}

//////////////
// Mapping //
////////////

// Map a like for use in this app.
export function mapLike(candid: [Principal, TokenIndex, Principal]): Like {
    return {
        canister: candid[0].toText(),
        index: Number(candid[1]),
        user: candid[2].toText(),
    };
}

///////////////
// Fetching //
/////////////

// Like a token.
export function like(token: Token) {
    likes
        .like(Principal.fromText(token.canister), BigInt(token.index))
        .then(() => queryClient.invalidateQueries(`likes-${token.canister}`));
}

// Unlike a token.
export function unlike(token: Token) {
    likes
        .unlike(Principal.fromText(token.canister), BigInt(token.index))
        .then(() => queryClient.invalidateQueries(`likes-${token.canister}`));
}

// Fetch all likes, or likes for a specific canister.
function fetchLikes(canister?: Principal) {
    return likes
        .get(canister ? [canister] : [])
        .then(r => (r[0] ? r[0].map(mapLike) : []));
}

// Fetch number of likes for a given token.
async function fetchLikeCount(token: Token) {
    return Number(
        await likes.count(
            Principal.fromText(token.canister),
            BigInt(token.index)
        )
    );
}

////////////
// Hooks //
///////////

// Hook to retrieve whether a token is liked by a principal.
export function useIsLiked(
    canister: Principal,
    index: number,
    principal?: Principal
) {
    const query = useQuery(
        `likes-${canister.toText()}`,
        () => fetchLikes(canister),
        cache
    );
    return {
        isLiked:
            query.data?.findIndex(
                x => x.user === principal?.toText() && x.index === index
            ) !== -1,
        isLoading: query.isLoading,
        error: query.error,
        query,
    };
}

// Hook to retrieve like count for a token.
export function useLikeCount(canister: Principal, index: number) {
    const query = useQuery(
        `likes-${canister.toText()}`,
        () => fetchLikes(canister),
        cache
    );
    return {
        count: query.data?.filter(x => x.index === index)?.length,
        isLoading: query.isLoading,
        error: query.error,
        query,
    };
}

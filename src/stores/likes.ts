// A slice of the Bazaar store handling likes.

import { Principal } from '@dfinity/principal';
import { TokenIndex } from 'canisters/likes/likes.did.d';
import { CompleteStore, StoreSlice } from 'stores/index';

export interface Token {
    canister: string;
    index: number;
};

export interface Like {
    canister: Principal;
    index: number;
    user: Principal;
};

export function mapLike(
    candid: [Principal, TokenIndex, Principal],
): Like {
    return {
        canister: candid[0],
        index: Number(candid[1]),
        user: candid[2],
    };
}

export interface LikesStore {
    likes: Like[];
    like: (token: Like) => void;
    unlike: (token: Like) => void;
    fetchLikes: () => void;
    doesLike: (t: Token) => boolean;
    likeCount: (t: Token) => Promise<number>;
};

export const createLikesSlice: StoreSlice<LikesStore, CompleteStore> = (set, get) => ({

    likes: [],

    doesLike(token) {
        return get().likes.findIndex(x => x.canister.toText() === token.canister && x.index === token.index) > -1;
    },

    like(token) {
        const { actors : { likes } } = get();
        likes.like(token.canister, BigInt(token.index))
            .then(get().fetchLikes);

        set(state => ({
            likes: [...state.likes, token],
        }));
    },

    unlike(token) {
        const { actors : { likes } } = get();
        likes.unlike(token.canister, BigInt(token.index))
            .then(get().fetchLikes);

        set(state => ({
            likes: state.likes.filter(x => !(token.canister === x.canister) && !(token.index === x.index)),
        }));
    },

    fetchLikes() {
        const { actors : { likes } } = get();
        likes.get([])
            .then(r => {
                set({ likes: r[0] ? r[0].map(mapLike) : [] })
            })
    },

    async likeCount(token) {
        const { actors : { likes } } = get();
        return Number(await likes.count(Principal.fromText(token.canister), BigInt(token.index)))
    },

});

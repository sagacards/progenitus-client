import { Principal } from '@dfinity/principal';
import { TokenIndex } from 'canisters/likes/likes.did';

export interface Like {
    canister: Principal;
    index: number;
    user: Principal;
};

export function mapLike (
    candid : [Principal, TokenIndex, Principal],
) : Like {
    return {
        canister : candid[0],
        index: Number(candid[1]),
        user: candid[2],
    };
}
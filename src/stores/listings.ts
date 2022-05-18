// A slice of the Bazaar store handling the sync and storage of listed NFTs.

import { Principal } from '@dfinity/principal';
import { Listing as ExtListing, TokenIndex } from 'canisters/legends/legends.did.d';
import { DateTime } from 'luxon';
import { mapDate } from 'stores/minting';
import { Price } from 'src/logic/transactions';
import { CompleteStore, StoreSlice } from '.';

type CanisterId = string;

export interface Listing {
    id: number;
    canister: string;
    subaccount?: Number[];
    locked?: DateTime;
    seller: Principal;
    price: Price;
};

export interface ListingsStore {
    listings: { [key : CanisterId] : Listing[] }
};

export const createListingSlice : StoreSlice<ListingsStore, CompleteStore> = (set, get) => ({

    listings: {},

});

function mapListing (
    canister : string,
    [index, listing] : [TokenIndex, ExtListing, unknown],
) : Listing {
    return {
        canister,
        id: index,
        subaccount: listing.subaccount.length ? listing.subaccount[0] : undefined,
        locked: listing.locked.length ? mapDate(listing.locked[0]) : undefined,
        seller: listing.seller as unknown as Principal, // Principal lib mismatch
        price: mapPrice(listing.price),
    };
}

function mapPrice (price : bigint) : Price {
    return {
        value: Number(price),
        decimals: 8,
        currency: 'ICP',
    }
}
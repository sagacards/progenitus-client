import { Principal } from '@dfinity/principal';
import { DateTime } from 'luxon';
import { ExtListing, TokenIndex } from 'canisters/legends/legends.did.d';
import { mapDate } from 'stores/minting';
import { Price } from 'src/logic/transactions';
import { useQueries, useQuery } from 'react-query';
import { getLegendActor } from 'stores/actors';
import { useTokenStore } from 'stores/provenance';
import { encodeTokenIdentifier } from 'ictool';
import useStore from 'stores/index';

// An NFT marketplace listing.
export interface Listing {
    token: string;
    id: number;
    canister: string;
    locked?: DateTime;
    seller: Principal;
    price: Price;
};

// Map an NFT marketplace listing from canister response for use in this app.
function mapListing (
    canister : string,
    [index, listing] : [TokenIndex, ExtListing],
) : Listing {
    return {
        canister,
        token: encodeTokenIdentifier(canister, index),
        id: index,
        locked: listing.locked.length ? mapDate(listing.locked[0]) : undefined,
        seller: listing.seller as unknown as Principal, // Principal lib mismatch
        price: mapPrice(listing.price),
    };
}

// Map a price object from the IC for use in this app.
function mapPrice (price : bigint) : Price {
    return {
        value: Number(price),
        decimals: 8,
        currency: 'ICP',
    }
}

// Convert exponent price object into a float.
export function priceFloat (
    price : Price,
) : number {
    return price.value / 10 ** price.decimals;
};

// Perform currency conversion and display exponent price object as string.
export function priceConvertDisplay (
    price : Price,
    conversion : number,
) : string {
    return `$${(priceFloat(price) * conversion).toFixed(2)}`;
}

// Display exponent price object as string.
export function priceDisplay (
    price: Price,
) : string {
    return `${priceFloat(price).toFixed(2)} ${price.currency}`;
};

// Retrieve NFT marketplace listings from a specific canister.
function fetchListings (
    canister : string,
) : Promise<Listing[]> {
    return getLegendActor(canister)
    .listings()
    .then(resp => resp.map(([index, listing]) => mapListing(canister, [index, listing])))
    .catch(error => {
        console.error(`Error fetching listings from canister ${canister}`, error);
        throw new Error('Could not retrieve listings.');
    })
};

// react-query (caching, persistence, throttling, etc) hook for consuming listings data.
export function useCanisterListings (
    canister : string,
) {
    const query = useQuery<Listing[], string>(`listings-${canister}`, () => fetchListings(canister));
    return {
        listings : query.data,
        isLoading: query.isLoading,
        error: query.error,
        query,
    };
};

// react-query hook for listings data from all legends canisters.
export function useAllLegendListings () {
    const { dab } = useTokenStore();
    const query = useQueries(Object.keys(dab).map(canister => ({
        queryKey: `listings-${canister}`,
        queryFn: () => fetchListings(canister),
    })));
    return query.reduce((agg, query) => ([
        ...agg,
        ...query?.data || [],
    ]), [] as Listing[]);
}

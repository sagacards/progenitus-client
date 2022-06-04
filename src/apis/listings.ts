import { Principal } from '@dfinity/principal';
import { DateTime } from 'luxon';
import { ExtListing, TokenIndex } from 'canisters/legends/legends.did.d';
import { mapDate } from 'stores/minting';
import { useQueries, useQuery } from 'react-query';
import { getLegendActor } from 'stores/actors';
import { encodeTokenIdentifier } from 'ictool';
import { useTarotDAB } from './dab';


////////////
// Types //
//////////


// An NFT marketplace listing.
export interface Listing {
    token: string;
    id: number;
    canister: string;
    locked?: DateTime;
    seller: string;
    price: Price;
};

// An exponent price object (from CAP).
export interface Price {
    value: number,
    currency: string,
    decimals: number,
};


//////////////
// Mapping //
////////////


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
        seller: listing.seller.toText(),
        price: mapPrice(listing.price),
    };
};

// Map a price object from the IC for use in this app.
function mapPrice (price : bigint) : Price {
    return {
        value: Number(price),
        decimals: 8,
        currency: 'ICP',
    }
};

// We also include below functions for working with price objects.

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
};

// Display exponent price object as string.
export function priceDisplay (
    price: Price,
) : string {
    return `${priceFloat(price).toFixed(2)} ${price.currency}`;
};


///////////////
// Fetching //
/////////////


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

// Hook to retrieve listings for a specific canister.
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

// Hook to retrieve listings for all Legends canisters.
export function useAllLegendListings () {
    const { data : dab } = useTarotDAB();
    const query = useQueries(dab?.map(canister => ({
        queryKey: `listings-${canister.principal}`,
        queryFn: () => fetchListings(canister.principal),
        enabled: !!dab,
    })) || []);
    return query.reduce((agg, query) => ([
        ...agg,
        ...query?.data || [],
    ]), [] as Listing[]);
};


/////////////////
// Data Views //
///////////////

// We provide additional functions to achieve different views on the data, i.e. sorting and filtering.
// Use these methods inside a memo.


// Filter a list of listings.
export function filterListings () {};

// Sort a list of listings.
export function sortListings (
    listings : Listing[],
) {
    return listings.sort((a, b) => a.price.value - b.price.value)
};

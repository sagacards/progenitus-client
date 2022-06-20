import React from 'react';
import { DateTime } from 'luxon';
import { useMutation, useQueries, useQuery } from 'react-query';
import { decodeTokenIdentifier, encodeTokenIdentifier } from 'ictool';
import { ExtListing, TokenIndex } from 'canisters/legends/legends.did.d';
import { mapDate } from 'stores/minting';
import { getLegendActor } from 'stores/actors';
import { useDirectory } from 'api/dab';
import { ICP8s, unpackResult } from 'api/.common';
import { legend } from 'api/actors';
import { queryClient } from 'src/App';

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
    listed: boolean;
}

// An exponent price object (from CAP).
export interface Price {
    value: number;
    currency: string;
    decimals: number;
}

//////////////
// Mapping //
////////////

// Map an NFT marketplace listing from canister response for use in this app.
function mapListing(
    canister: string,
    [index, listing]: [TokenIndex, ExtListing]
): Listing {
    return {
        canister,
        token: encodeTokenIdentifier(canister, index),
        id: index,
        locked: listing.locked.length ? mapDate(listing.locked[0]) : undefined,
        seller: listing.seller.toText(),
        price: mapPrice(listing.price),
        listed: Number(listing.price) !== 0,
    };
}

// Map a price object from the IC for use in this app.
function mapPrice(price: bigint): Price {
    return {
        value: Number(price),
        decimals: 8,
        currency: 'ICP',
    };
}

// We also include below functions for working with price objects.

// Convert exponent price object into a float.
export function priceFloat(price: Price): number {
    return price.value / 10 ** price.decimals;
}

// Perform currency conversion and display exponent price object as string.
export function priceConvertDisplay(price: Price, conversion: number): string {
    return `$${(priceFloat(price) * conversion).toFixed(2)}`;
}

// Display exponent price object as string.
export function priceDisplay(price: Price): string {
    return `${priceFloat(price).toFixed(2)} ${price.currency}`;
}

/////////////
// Quries //
///////////

// Retrieve NFT marketplace listings from a specific canister.
function queryListings(canister: string): Promise<Listing[]> {
    return getLegendActor(canister)
        .listings()
        .then(resp =>
            resp.map(([index, listing]) =>
                mapListing(canister, [index, listing])
            )
        )
        .catch(error => {
            console.error(
                `Error fetching listings from canister ${canister}`,
                error
            );
            throw new Error('Could not retrieve listings.');
        });
}

//////////////
// Updates //
////////////

// Call to edit a listing.
// TODO: Error/result handling
function updateListing(token: string, price?: ICP8s) {
    const { canister } = decodeTokenIdentifier(token);
    return legend(canister)
        .list({
            token,
            from_subaccount: [],
            price: price ? [BigInt(price.e8s)] : [],
        })
        .then(unpackResult);
}

/** Call to lock a listing for purchase.
 * @param token ext identifier of token to be purchased
 * @param price price to pay in e8s form, must match list price
 * @param buyer address format of the purchasing principal
 * @returns address to transfer funds to complete purchase
 */
// TODO: Error/result handling
async function updateLock(token: string, price: ICP8s, buyer: string) {
    const { canister } = decodeTokenIdentifier(token);
    return unpackResult(
        await legend(canister).lock(token, BigInt(price.e8s), buyer, [])
    );
}

////////////
// Hooks //
//////////

// Hook to retrieve listings for a specific canister.
export function useCanisterListings(canister: string) {
    const query = useQuery<Listing[], string>(`listings-${canister}`, () =>
        queryListings(canister)
    );
    return {
        listings: query.data,
        isLoading: query.isLoading,
        error: query.error,
        query,
    };
}

// Hook to retrieve listings for all Legends canisters.
export function useAllLegendListings() {
    const { data: dab } = useDirectory();
    const query = useQueries(
        dab?.map(canister => ({
            queryKey: `listings-${canister.principal}`,
            queryFn: () => queryListings(canister.principal),
            enabled: !!dab,
            refetchInterval: 60_000,
        })) || []
    );
    return query.reduce(
        (agg, query) => [...agg, ...(query?.data || [])],
        [] as Listing[]
    );
}

// Hook to retrieve listing for specific token.
export function useListing(token: string) {
    const { canister } = decodeTokenIdentifier(token);
    const query = useQuery(
        `listings-${canister}`,
        () => queryListings(canister),
        {
            cacheTime: 60_000 * 5,
            staleTime: 10_000,
            refetchInterval: 10_000,
        }
    );
    return {
        ...query,
        data: query?.data && query.data.find(x => x.token === token),
    };
}

interface MutateListingRequest {
    token: string;
    price?: ICP8s;
}

// Hook to edit a listing.
export function useMutateListing() {
    return useMutation<null, { err: string }, MutateListingRequest, unknown>({
        mutationFn: ({ token, price }) => updateListing(token, price),
        onSuccess(data, { token, price }: MutateListingRequest) {
            const { canister } = decodeTokenIdentifier(token);
            queryClient.invalidateQueries(`listings-${canister}`);
        },
        onError(data) {
            alert(`Failed to update listing: ${data.err}`);
        },
    });
}

interface MutateLockRequest {
    token: string;
    price: ICP8s;
    buyer: string;
}

// Hook to lock a listing for purchase
export function useMutateLock() {
    return useMutation<string, null, MutateLockRequest, unknown>({
        mutationFn: ({ token, price, buyer }) =>
            updateLock(token, price, buyer),
    });
}

// Hook to determine whether a listing is locked.
export function useIsLocked(listing?: Listing) {
    return React.useMemo(() => {
        return listing?.locked && listing.locked.diffNow().milliseconds > 0;
    }, [listing]);
}

/////////////////
// Data Views //
///////////////

// We provide additional functions to achieve different views on the data, i.e. sorting and filtering.
// Use these methods inside a memo.

// Filter a list of listings.
export function filterListings() {}

// Sort a list of listings.
export function sortListings(listings: Listing[]) {
    return listings.sort((a, b) => a.price.value - b.price.value);
}

// Canister handling the minting/initial sale protocol.

import { Principal } from '@dfinity/principal';
import { DateTime } from 'luxon';
import { useQueries, useQuery } from 'react-query';
import { CanisterId, ICP8s, mapDate, mapToken } from 'api/_common';
import { Data, Rex } from 'canisters/progenitus/progenitus.did.d';
import { ActorSubclass } from '@dfinity/agent';
import { bazaar, legend } from './actors';

////////////
// Types //
//////////

// Possible states of a user's eligibility to mint.
export type MintableResponse =
    | 'minting'
    | 'not-connected'
    | 'loading'
    | 'no-access'
    | 'insufficient-funds'
    | 'not-started'
    | 'ended'
    | 'no-supply'
    | 'mintable';

// A minting event.
export interface MintingEvent {
    id: number;
    price: ICP8s;
    access: 'private' | 'public';
    startDate: DateTime;
    endDate: DateTime;
    collection: EventCollectionDetails;
}

// An NFT collection may have event-specific details.
export interface EventCollectionDetails {
    canister: CanisterId;
    banner: string;
    icon: string;
    preview: string;
    name: string;
    description: string;
}

//////////////
// Mapping //
////////////

// Map event for use in this app.
export function mapEvent(
    canister: Principal,
    candid: Data,
    index: bigint
): MintingEvent {
    return {
        id: Number(index),
        price: mapToken(candid.price),
        access: candid.accessType.hasOwnProperty('Private')
            ? 'private'
            : 'public',
        startDate: mapDate(candid.startsAt),
        endDate: mapDate(candid.endsAt),
        collection: {
            icon: candid.details.iconImageUrl,
            banner: candid.details.bannerImageUrl,
            preview: candid.details.previewImageUrl,
            description: candid.details.descriptionMarkdownUrl,
            name: candid.name,
            canister: canister.toString(),
        },
    };
}

///////////////
// Fetching //
/////////////

// Retrieve all minting events.
async function fetchAllEvents(): Promise<MintingEvent[]> {
    return bazaar.getAllEvents().then(r => {
        return r.map(([p, e, i]) => mapEvent(p, e, i));
    });
}

// Retrieve minting event for a specific canister.
async function fetchEvents(canister: string): Promise<MintingEvent[]> {
    return bazaar.getEvents([Principal.fromText(canister)]).then(r => {
        return r.map(([p, e, i]) => mapEvent(p, e, i));
    });
}

// Retrieve remaining mint supply for an event.
async function fetchSupply(canister: string, event: number): Promise<number> {
    return Number(
        await legend(canister).launchpadTotalAvailable(BigInt(event))
    );
}

////////////
// Hooks //
//////////

// Hook to retrieve a public event for a given canister which has time and supply remaining.
export function useOpenEvent(canister: string) {
    const query = useQuery<MintingEvent[], string>(
        `events-${canister}`,
        () => fetchEvents(canister),
        {
            cacheTime: 60_000 * 60 * 24 * 7,
            staleTime: 60_000 * 60 * 24 * 1,
        }
    );
    // Filter out private and out of time events.
    const events = query.data?.filter(
        x =>
            x.access === 'public' &&
            x.startDate?.toMillis() <= new Date().getTime() &&
            (x.endDate?.toMillis() === 0 ||
                x.endDate?.toMillis() >= new Date().getTime())
    );
    const withSupply = useQueries(
        events?.map(x => ({
            queryKey: `event-supply-${canister}-${x.id}`,
            queryFn: async () => ({
                supply: await fetchSupply(canister, x.id),
                event: x,
            }),
            cacheTime: 60_000 * 60 * 24,
            staleTime: 60_000,
            refetchInterval: 60_000,
            enable: query.data?.length,
        })) || []
    );

    return withSupply.find(x => x.data?.supply && x.data.supply > 0);
}

////////////////////
// Minting Logic //
//////////////////

// Determine whether a user can mint in an event.
export function eventIsMintable(
    event?: MintingEvent,
    supplyRemaining?: number,
    connected?: boolean,
    userBalance?: ICP8s,
    userAllowlist?: number,
    isMinting?: boolean
): MintableResponse {
    let r: MintableResponse;
    if (isMinting) r = 'minting';
    else if (!connected) r = 'not-connected';
    else if (event === undefined || userBalance === undefined) r = 'loading';
    else if (userAllowlist === 0) r = 'no-access';
    else if (userBalance.e8s < event.price.e8s) r = 'insufficient-funds';
    else if (
        eventIsTimeGated(event) &&
        DateTime.now().toMillis() < event.startDate.toMillis()
    )
        r = 'not-started';
    else if (
        eventIsTimeGated(event) &&
        DateTime.now().toMillis() > event.endDate.toMillis()
    )
        r = 'ended';
    else if (supplyRemaining === 0) r = 'no-supply';
    else r = 'mintable';
    return r;
}

// Determine if an event is time gated.
export function eventIsTimeGated(event?: MintingEvent) {
    return event?.endDate.toMillis() !== 0 || event?.startDate.toMillis() !== 0;
}

// Mint an NFT.
export function mint(
    event?: MintingEvent,
    supplyRemaining?: number,
    connected?: boolean,
    userBalance?: ICP8s,
    userAllowlist?: number,
    actor?: ActorSubclass<Rex>,
    index?: number
) {
    const mintable = eventIsMintable(
        event,
        supplyRemaining,
        connected,
        userBalance,
        userAllowlist
    );
    if (
        mintable !== 'mintable' ||
        actor === undefined ||
        event === undefined ||
        index === undefined
    ) {
        alert(`Cannot mint. ${mintable}`);
        return new Promise<void>((resolve, reject) => reject());
    }
    return actor.mint(
        Principal.fromText(event.collection.canister),
        BigInt(index)
    );
}

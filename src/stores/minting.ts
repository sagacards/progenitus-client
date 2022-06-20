// A slice of the Bazaar store handling the minting canister.

import { ActorSubclass } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { DateTime } from 'luxon';
import { Rex, Data } from 'canisters/progenitus/progenitus.did.d';
import { CompleteStore, StoreSlice } from 'stores/index';
import { ICP8s } from 'stores/connect';
import { getLegendActor } from './actors';

type CanisterId = string;

interface EventsMap {
    [key: string]: { [key: number]: MintingEvent };
}

export interface Collection {
    canister: CanisterId;
    banner: string;
    icon: string;
    preview: string;
    name: string;
    description: string;
}

export interface MintingStore {
    events: EventsMap;
    getEvent: (c: string, i: number) => MintingEvent | undefined;
    fetchEvents: () => void;
    eventsLastFetch?: Date;

    eventSupply: { [key: string]: { [key: number]: number } };
    fetchSupply: (c: string, i: number) => void;

    isMinting: boolean;
    setIsMinting: (m: boolean) => void;
    mintResult?: number;
    setMintResult: (m: number | undefined) => void;
}

// Main store function.
export const createMintingSlice: StoreSlice<MintingStore, CompleteStore> = (
    set,
    get
) => ({
    // Events

    events: {},

    getEvent(canister, index) {
        const { events } = get();
        return events?.[canister]?.[index];
    },

    fetchEvents() {
        const {
            actors: { bazaar },
        } = get();
        // Mock Events
        // set({ events: makeEvents() });

        // Real Events
        bazaar.getAllEvents().then(r => {
            const events = r
                .map(([p, e, i]) => mapEvent(p, e, i))
                .reduce(
                    (agg, e) => ({
                        ...agg,
                        [e.collection.canister]: {
                            ...agg[e.collection.canister],
                            [e.id]: e,
                        },
                    }),
                    {} as EventsMap
                );

            set({
                events,
                eventsLastFetch: new Date(),
            });
        });
    },

    // Event Supply

    eventSupply: {},

    fetchSupply(canister, index) {
        const { eventSupply } = get();
        const n = { ...eventSupply };
        n?.[canister]?.[index];
        getLegendActor(canister)
            .launchpadTotalAvailable(BigInt(index))
            .then(s => {
                n[canister] = n[canister] || {};
                n[canister][index] = Number(s);
                set({ eventSupply: n });
            });
    },

    // Minting

    isMinting: false,
    setIsMinting(isMinting) {
        set({ isMinting });
    },
    mintResult: undefined,
    setMintResult(mintResult) {
        set({ mintResult });
    },
});

export interface MintingEvent {
    id: number;
    price: ICP8s;
    access: 'private' | 'public';
    startDate: DateTime;
    endDate: DateTime;
    collection: Collection;
}

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

export function mapToken(candid: { e8s: bigint }): ICP8s {
    return { e8s: Number(candid.e8s) };
}

export function mapDate(candid: bigint): DateTime {
    const millis = Number(candid) / 10 ** 6;
    const date = DateTime.fromMillis(millis, {
        zone: 'America/Vancouver',
    });
    return date;
}

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

export function eventIsTimeGated(event?: MintingEvent) {
    return event?.endDate.toMillis() !== 0 || event?.startDate.toMillis() !== 0;
}

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

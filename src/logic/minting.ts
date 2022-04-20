import { ActorSubclass } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { Data, Rex } from 'canisters/progenitus/progenitus.did';
import { Collection, ICP8s } from "stores/index"

export interface MintingEvent {
    id          : number;
    supply      : number;
    price       : ICP8s;
    access      : 'private' | 'public';
    startDate   : Date;
    endDate     : Date;
    collection  : Collection;
}

export function mapEvent (
    canister: Principal,
    candid  : Data,
    index   : BigInt,
) : MintingEvent {
    return {
        id          : Number(index),
        supply      : 0, // TODO: Sort out paradigm for this data
        price       : mapToken(candid.price),
        access      : candid.accessType.hasOwnProperty('Private') ? 'private' : 'public',
        startDate   : mapDate(candid.startsAt),
        endDate     : mapDate(candid.endsAt),
        // TODO: Remove description
        collection  : {
            icon: candid.details.iconImageUrl,
            banner: candid.details.bannerImageUrl,
            preview: candid.details.previewImageUrl,
            description: candid.details.descriptionMarkdownUrl,
            name: candid.name,
            canister: canister.toString(),
        },
    };
};

export function mapToken (
    candid : { e8s : BigInt }
) : ICP8s {
    return { e8s : Number(candid.e8s) };
};

export function mapDate (
    candid : BigInt
) : Date {
    return new Date(Number(candid) / (10 ** 6));
};

export type MintableResponse =  'minting' | 'not-connected' | 'loading' | 'no-access' | 'insufficient-funds' | 'not-started' | 'ended' | 'no-supply' | 'mintable';

export function eventIsMintable (
    event?          : MintingEvent,
    supplyRemaining?: number,
    connected?      : boolean,
    userBalance?    : ICP8s,
    userAllowlist?  : number,
    isMinting?      : boolean,
) : MintableResponse {
    let r : MintableResponse;
    if (isMinting) r = 'minting';
    else if (!connected) r = 'not-connected';
    else if (event === undefined || userBalance === undefined) r = 'loading';
    else if (userAllowlist === 0) r = 'no-access';
    else if (userBalance.e8s < event.price.e8s) r = 'insufficient-funds';
    else if (new Date().getTime() < event.startDate.getTime()) r = 'not-started';
    else if (new Date().getTime() > event.endDate.getTime()) r = 'ended';
    else if (supplyRemaining === 0) r = 'no-supply';
    else r = 'mintable';
    return r;
};

export function mint (
    event?          : MintingEvent,
    supplyRemaining?: number,
    connected?      : boolean,
    userBalance?    : ICP8s,
    userAllowlist?  : number,
    actor?          : ActorSubclass<Rex>,
    index?          : number,
) {
    const mintable = eventIsMintable(event, supplyRemaining, connected, userBalance, userAllowlist);
    if (mintable !== 'mintable' || actor === undefined || event === undefined || index === undefined) {
        alert(`Cannot mint. ${mintable}`)
        return new Promise<void>((resolve, reject) => reject());
    };
    return actor.mint(Principal.fromText(event.collection.canister), BigInt(index));
};
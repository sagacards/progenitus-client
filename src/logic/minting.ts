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

export type MintableResponse =  'not-connected' | 'loading' | 'no-access' | 'insufficient-funds' | 'not-started' | 'ended' | 'no-supply' | 'mintable';

export function eventIsMintable (
    event?          : MintingEvent,
    supplyRemaining?: number,
    connected?      : boolean,
    userBalance?    : ICP8s,
    userAllowlist?  : number,
) : MintableResponse {
    let r : MintableResponse;
    if (!connected) r = 'not-connected';
    else if (!event || !userBalance) r = 'loading';
    else if (userAllowlist === 0) r = 'no-access';
    else if (userBalance.e8s < event.price.e8s) r = 'insufficient-funds';
    else if (new Date().getTime() < event.startDate.getTime()) r = 'not-started';
    else if (new Date().getTime() > event.endDate.getTime()) r = 'ended';
    else if (supplyRemaining === 0) r = 'no-supply';
    else r = 'mintable';
    // console.log(r)
    return r;
};

export function mint (
    event?          : MintingEvent,
    supplyRemaining?: number,
    connected?      : boolean,
    userBalance?    : ICP8s,
    userAllowlist?  : number,
) {
    const mintable = eventIsMintable(event, supplyRemaining, connected, userBalance, userAllowlist);
    if (mintable !== 'mintable') {
        alert(`Cannot mint. ${mintable}`)
        return;
    };
};
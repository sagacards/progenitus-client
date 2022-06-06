// A global singleton for our internet computer actors.
// This pattern works very well except that it doesn't support Plug.

import * as Agent from '@dfinity/agent';
import { InterfaceFactory } from '@dfinity/candid/lib/cjs/idl';

import { idlFactory as BazaarIDL } from 'canisters/progenitus/progenitus.did';
import { idlFactory as CyclesIDL } from 'canisters/cycles/cycles.did';
import { idlFactory as LikesIDL } from 'canisters/likes/likes.did';
import { idlFactory as LegendsIDL } from 'canisters/legends/legends.did';
import { idlFactory as NnsIDL } from 'canisters/ledger/ledger.did';
import { Ledger } from 'canisters/ledger/ledger.did.d';
import { LegendsNFT } from 'canisters/legends/legends.did.d';
import { Likes } from 'canisters/likes/likes.did.d';
import { Rex } from 'canisters/progenitus/progenitus.did.d';

/////////////
// Config //
///////////

export const ic = {
    protocol: (import.meta.env.PROGENITUS_IC_PROTOCOL as string) || 'https',
    host: (import.meta.env.PROGENITUS_IC_HOST as string) || 'ic0.app',
    isLocal: import.meta.env.PROGENITUS_IS_LOCAL === 'true',
};

export const host = `${ic.protocol}://${ic.host}`;

// TODO: All canisters in TarotDAB
export const whitelist = [
    import.meta.env.PROGENITUS_CANISTER_ID,
    import.meta.env.PROGENITUS_LIKES_CANISTER_ID,
    import.meta.env.PROGENITUS_CYCLES_CANISTER_ID,
];

////////////
// Agent //
//////////

// The same agent powers all actors.
const agent = new Agent.HttpAgent({ host });

// When user connects an identity, we update our agent.
export function replaceIdentity(identity: Agent.Identity) {
    agent.replaceIdentity(identity);
}

// When user disconnects an identity, we update our agent.
export function invalidateIdentity() {
    agent.invalidateIdentity();
}

//////////
// Lib //
////////

// Create an actor.
export function actor<T>(
    canisterId: string,
    factory: InterfaceFactory,
    config?: Agent.ActorConfig
): Agent.ActorSubclass<T> {
    return Agent.Actor.createActor(factory, { canisterId, agent, ...config });
}

/////////////
// Actors //
///////////

export const likes = actor<Likes>(
    import.meta.env.PROGENITUS_LIKES_CANISTER_ID,
    LikesIDL
);

const legends: { [key: string]: Agent.ActorSubclass<LegendsNFT> } = {};
export const legend = (canisterId: string): Agent.ActorSubclass<LegendsNFT> => {
    if (!(canisterId in legends)) {
        legends[canisterId] = actor<LegendsNFT>(canisterId, LegendsIDL);
    }
    return legends[canisterId];
};

export const bazaar = actor<Rex>(
    import.meta.env.PROGENITUS_CANISTER_ID,
    BazaarIDL
);

export const cycles = actor<Ledger>(
    import.meta.env.PROGENITUS_CYCLES_CANISTER_ID,
    CyclesIDL
);

export const nns = actor<Ledger>(
    import.meta.env.PROGENITUS_NNS_CANISTER_ID,
    NnsIDL
);

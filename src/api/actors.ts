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

// Plug wallet whitelist
export const whitelist = async (): Promise<string[]> => [
    import.meta.env.PROGENITUS_CANISTER_ID,
    import.meta.env.PROGENITUS_LIKES_CANISTER_ID,
    import.meta.env.PROGENITUS_CYCLES_CANISTER_ID,
    ...(await dabWhitelist()),
];

export const ic = {
    protocol: (import.meta.env.PROGENITUS_IC_PROTOCOL as string) || 'https',
    host: (import.meta.env.PROGENITUS_IC_HOST as string) || 'ic0.app',
    isLocal: import.meta.env.PROGENITUS_IS_LOCAL === 'true',
};

export const host = `${ic.protocol}://${ic.host}`;

////////////
// Agent //
//////////

// We share the same agent across all actors, and replace the identity when connection events occur.

// When user connects an identity, we update our agent.
export function replaceIdentity(identity: Agent.Identity) {
    agent.replaceIdentity(identity);
}

// When user disconnects an identity, we update our agent.
export function invalidateIdentity() {
    agent.invalidateIdentity();
}

// The same agent powers all actors.
export const agent = new Agent.HttpAgent({ host });

/////////////
// Actors //
///////////

// The actors make up the bulk of the public API of this module. We can import these to message ic canisters through this app. We shouldn't need any actors other than those defined here.

// These would all be constants, but working around Plug requires recreating all the actors.

export let likes = actor<Likes>(
    import.meta.env.PROGENITUS_LIKES_CANISTER_ID,
    LikesIDL
);

const legends: { [key: string]: Agent.ActorSubclass<LegendsNFT> } = {};
export let legend = (canisterId: string): Agent.ActorSubclass<LegendsNFT> => {
    if (!(canisterId in legends)) {
        legends[canisterId] = actor<LegendsNFT>(canisterId, LegendsIDL);
    }
    return legends[canisterId];
};

export let bazaar = actor<Rex>(
    import.meta.env.PROGENITUS_CANISTER_ID,
    BazaarIDL
);

export let cycles = actor<Ledger>(
    import.meta.env.PROGENITUS_CYCLES_CANISTER_ID,
    CyclesIDL
);

export let nns = actor<Ledger>(
    import.meta.env.PROGENITUS_NNS_CANISTER_ID,
    NnsIDL
);

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

// We attempt to retrieve list of dab canisters first from the local react-query cache, then query the dab canister.
async function dabWhitelist(): Promise<string[]> {
    const { getAll } = await import('./dab');
    try {
        const cache = window.localStorage.getItem(
            'REACT_QUERY_OFFLINE_CACHE'
        ) as string;
        const json = JSON.parse(cache);
        return json.clientState.queries
            .find((x: any) => x.queryKey === 'dab')
            .state.data.map((x: any) => x.principal);
    } catch {
        console.info('Could not retrieve dab from local cache, fetching.');
        return (await getAll()).map(x => x.principal);
    }
}

///////////
// Plug //
/////////

// The Plug paradigm is different from stoic or ii: it attempts to restrict access to a raw agent or identity. Instead it exposes an api for creating actors, which gives users more granular control over which canister methods an app like ours can call. We have to provide

// Recreate all actors using the Plug API. Should be called when Plug is connected.
export async function respawnActorsPlug() {
    if (!window?.ic?.plug) {
        throw new Error(
            'Failed respawning actors with Plug: Plug is not available.'
        );
    }

    for (const canisterId in legends) {
        legends[canisterId] = await window?.ic?.plug.createActor<LegendsNFT>({
            canisterId,
            interfaceFactory: LegendsIDL,
        });
    }

    likes = await window?.ic?.plug.createActor<Likes>({
        canisterId: import.meta.env.PROGENITUS_LIKES_CANISTER_ID,
        interfaceFactory: LikesIDL,
    });

    bazaar = await window.ic.plug.createActor<Rex>({
        canisterId: import.meta.env.PROGENITUS_CANISTER_ID,
        interfaceFactory: BazaarIDL,
    });

    cycles = await window.ic.plug.createActor<Ledger>({
        canisterId: import.meta.env.PROGENITUS_CYCLES_CANISTER_ID,
        interfaceFactory: CyclesIDL,
    });

    nns = await window.ic.plug.createActor<Ledger>({
        canisterId: import.meta.env.PROGENITUS_NNS_CANISTER_ID,
        interfaceFactory: NnsIDL,
    });
}

// Recreate all actors using our standard method. Should be called when Plug is disconnected.
export function respawnActorsStandard() {
    likes = actor<Likes>(
        import.meta.env.PROGENITUS_LIKES_CANISTER_ID,
        LikesIDL
    );

    for (const canisterId in legends) {
        legends[canisterId] = actor<LegendsNFT>(canisterId, LegendsIDL);
    }

    bazaar = actor<Rex>(import.meta.env.PROGENITUS_CANISTER_ID, BazaarIDL);

    cycles = actor<Ledger>(
        import.meta.env.PROGENITUS_CYCLES_CANISTER_ID,
        CyclesIDL
    );

    nns = actor<Ledger>(import.meta.env.PROGENITUS_NNS_CANISTER_ID, NnsIDL);
}

// A slice of the Bazaar store handling actors for communicating with various canisters.

import { Actor, ActorSubclass, HttpAgent } from '@dfinity/agent'
import { idlFactory as BazaarIDL } from 'canisters/progenitus/progenitus.did'
import { idlFactory as CyclesIDL } from 'canisters/cycles/cycles.did'
import { idlFactory as LikesIDL } from 'canisters/likes/likes.did'
import { idlFactory as LegendsIDL } from 'canisters/legends/legends.did'
import { idlFactory as NnsIDL } from 'canisters/ledger/ledger.did'
import { Ledger } from 'canisters/ledger/ledger.did.d'
import { LegendsNFT } from 'canisters/legends/legends.did.d'
import { Likes } from 'canisters/likes/likes.did.d'
import { Rex } from 'canisters/progenitus/progenitus.did.d'
import { defaultAgent } from 'stores/connect'
import { CompleteStore, StoreSlice } from 'stores/index'

export interface ActorsStore {
    actors: {
        bazaar: ActorSubclass<Rex>,
        nns?: ActorSubclass<Ledger>,
        likes: ActorSubclass<Likes>,
        cycles: ActorSubclass<Ledger>,
    };

    createActors: () => void;
};

// TODO: How does DAB handle discovery of these IDs? It might be sweet to just swap out the DAB directory for dev/prod.
export const whitelist = [
    import.meta.env.PROGENITUS_CANISTER_ID,
    import.meta.env.PROGENITUS_LIKES_CANISTER_ID,
    import.meta.env.PROGENITUS_CYCLES_CANISTER_ID,
];

// Main store function.
export const createActorsSlice: StoreSlice<ActorsStore, CompleteStore> = (set, get) => ({

    actors: makeActors(),

    async createActors() {
        const { agent, wallet } = get();

        // Replace identity on actors.
        // Note: might be nice to use Actor.replaceIdentity, but plug best practice requires a proprietary actor creation method, so I'll stick to recreation for now.
        const actors = wallet === 'plug' ? await makeActorsPlug() : agent && makeActors(agent);

        set({ actors });
    },

});

function makeActors(agent: HttpAgent = defaultAgent) {
    const actors = {
        bazaar: Actor.createActor<Rex>(BazaarIDL, {
            agent,
            canisterId: import.meta.env.PROGENITUS_CANISTER_ID,
        }),
        nns: Actor.createActor<Ledger>(NnsIDL, {
            agent,
            canisterId: import.meta.env.PROGENITUS_NNS_CANISTER_ID,
        }),
        likes: Actor.createActor<Likes>(LikesIDL, {
            agent,
            canisterId: import.meta.env.PROGENITUS_LIKES_CANISTER_ID,
        }),
        cycles: Actor.createActor<Ledger>(CyclesIDL, {
            agent,
            canisterId: import.meta.env.PROGENITUS_CYCLES_CANISTER_ID,
        }),
    };
    return actors;
};

// TODO: Plug actors are... *acting* up!
async function makeActorsPlug() {
    if (!window.ic?.plug?.createActor) throw new Error(`Cannot create actors, missing plug API.`);
    const actors = {
        bazaar: window.ic.plug.createActor<Rex>({
            interfaceFactory: BazaarIDL,
            canisterId: import.meta.env.PROGENITUS_CANISTER_ID,
        }),
        likes: window.ic.plug.createActor<Likes>({
            interfaceFactory: LikesIDL,
            canisterId: import.meta.env.PROGENITUS_LIKES_CANISTER_ID,
        }),
        cycles: window.ic.plug.createActor<Ledger>({
            interfaceFactory: CyclesIDL,
            canisterId: import.meta.env.PROGENITUS_CYCLES_CANISTER_ID,
        }),
    };
    return actors;
};

export function getLegendActor(canisterId: string): ActorSubclass<LegendsNFT> {
    if (LegendActors[canisterId]) {
        return LegendActors[canisterId];
    } else {
        const actor = Actor.createActor<LegendsNFT>(LegendsIDL, {
            agent: defaultAgent,
            canisterId,
        });
        LegendActors[canisterId] = actor;
        return actor;
    };
};

// Dynamically created Legend NFT canister actors.
const LegendActors: { [key: string]: ActorSubclass<LegendsNFT> } = {};
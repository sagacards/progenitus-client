// The root Bazaar application store.

import create, { GetState, SetState } from 'zustand'
import { Actor } from '@dfinity/agent'
import { idlFactory as CyclesDID } from 'canisters/cycles/cycles.did';

// Slices of the store.
import { createAccountSlice, AccountStore } from 'stores/account';
import { createActorsSlice, ActorsStore } from 'stores/actors';
import { createConnectSlice, ConnectStore, defaultAgent } from 'stores/connect';
import { createLikesSlice, LikesStore } from 'stores/likes';
import { createMintingSlice, MintingStore } from 'stores/minting';

// Reexport submodules for convenience
import { Wallet } from 'stores/connect';
import { CAPEvent } from 'stores/provenance';
import { Listing } from 'apis/listings';
import { Token } from 'stores/likes';
import { eventIsMintable, eventIsTimeGated, mint, Collection } from 'stores/minting';
import { icConf } from 'stores/connect';
export type { CAPEvent, Listing, Token, Collection, Wallet };
export { eventIsMintable, eventIsTimeGated, mint, icConf };

// The store is broken into manageably sized "slices." Each slice is a function which creates a piece of the complete store (defined by this type).
// https://github.com/pmndrs/zustand/wiki/Splitting-the-store-into-separate-slices
export type StoreSlice<T extends object, E extends object = T> = (
    set: SetState<E extends T ? E : E & T>,
    get: GetState<E extends T ? E : E & T>
) => T;

// Interface of the complete store extends all its slices.
export interface CompleteStore extends ActorsStore, ConnectStore, AccountStore, MintingStore, CatchallStore, LikesStore { }

// Some things didn't fit into their own store.
interface CatchallStore {

    icpToUSD?: number;

    init: () => void;
    didInit: boolean;

};

// Catchall store creation function.
export const createCatchallSlice: StoreSlice<CatchallStore, CompleteStore> = (set, get) => ({

    didInit: false,

    async init() {

        const { didInit, initConnect, fetchBalance, fetchEvents } = get();

        // Idempotent init.
        if (didInit) return;

        // Init store slices.
        initConnect();

        // Fetch data.
        fetchBalance()
        fetchEvents();

        // Get ICP to USD exchange rate
        const cycles: any = await Actor.createActor(CyclesDID, {
            agent: defaultAgent,
            canisterId: 'rkp4c-7iaaa-aaaaa-aaaca-cai',
        }).get_icp_xdr_conversion_rate();
        const xdr = await fetch("https://free.currconv.com/api/v7/convert?q=XDR_USD&compact=ultra&apiKey=df6440fc0578491bb13eb2088c4f60c7").then(r => r.json());
        const icpToUSD = Number(cycles.data.xdr_permyriad_per_icp) / 10000 * (xdr.hasOwnProperty("XDR_USD") ? xdr.XDR_USD : 1.4023);

        set({ icpToUSD, didInit: true });
    },

})

// Create the root store.
const createStore = (set: SetState<any>, get: GetState<any>) => ({
    ...createAccountSlice(set, get),
    ...createActorsSlice(set, get),
    ...createCatchallSlice(set, get),
    ...createConnectSlice(set, get),
    ...createMintingSlice(set, get),
    ...createLikesSlice(set, get),
});

// Use the store with this.
const useStore = create<CompleteStore>(createStore);

export default useStore;

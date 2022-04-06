import create from 'zustand'
import { StoicIdentity } from "ic-stoic-identity";
import { Actor, ActorSubclass, Agent, HttpAgent } from '@dfinity/agent'
import { IDL } from '@dfinity/candid'
import { Principal } from '@dfinity/principal';
import axios from 'axios';
// @ts-ignore
import { Rex, idlFactory } from 'canisters/progenitus/progenitus.did.js'
// @ts-ignore
import { Ledger, idlFactory as nnsIdl } from 'canisters/ledger/ledger.did.js'
// @ts-ignore
import { MockNFT, idlFactory as nftIdl } from 'canisters/nft/mock_nft.did.js'
// @ts-ignore
import CyclesDID from 'canisters/cycles/cycles.did.js';
// @ts-ignore
import { principalToAccountIdentifier, buf2hex } from 'util/ext'
import makeEvents, { history, makeCollections } from 'mock/index'
import { mapEvent, MintingEvent } from 'src/logic/minting';

type ColorScheme = 'dark' | 'light';

export type Wallet = 'plug' | 'stoic' | 'earth' | 'ii';

export interface Message {
    type    : 'error' | 'info';
    message : string;
    read?   : boolean;
};

export interface Collection {
    canister    : CanisterId;
    banner      : string;
    icon        : string;
    name        : string;
    description : string;
};

export interface CAPEvent {
    timestamp : Date;
    type: 'mint' | 'transfer' | 'sale';
};

export interface Token {
    canister: string;
    index   : number;
};

export interface ICP8s {
    e8s : number;
};

export interface _Token {
    token : Token;
    listing?: Listing;
    event?: CAPEvent;
};

interface EventsMap { [key : string] :  { [key : number] : MintingEvent } };

type CanisterId = string;
type TokenIndex = number;

interface Store {

    defaultAgent?   : Agent;
    icpToUSD?       : number;

    defaultActor    : ActorSubclass<Rex>;

    actor?          : ActorSubclass<Rex>;
    principal?      : Principal;
    connected       : boolean;
    connecting      : boolean;
    idempotentConnect: () => null | (() => void);
    stoicConnect    : () => void;
    plugConnect     : () => void;
    disconnect      : () => void;
    wallet?         : Wallet;
    
    ledgerActor?    : ActorSubclass<Ledger>;
    address?        : string;
    balance?        : ICP8s;
    fetchBalance    : () => void;
    deposit         : (a : number) => Promise<void>;
    withdraw        : (a : number) => Promise<void>;
    balanceDisplay  : () => number | undefined;

    colorScheme: ColorScheme;
    setColorScheme: (c : ColorScheme) => void;

    isLocal : boolean;
    edges   : boolean;
    setEdges: (e : boolean) => void;

    init: () => void;

    messages: { [key: number] : Message };
    pushMessage: (m : Message) => void;
    readMessage: (i : number) => void;

    getNftActor : (c : string) => ActorSubclass<MockNFT>;

    events      : EventsMap;
    getEvent    : (c : string, i : number) => MintingEvent | undefined;
    fetchEvents : () => void;

    eventSupply : { [key : string] : { [key : number] : number } };
    fetchSupply : (c : string, i : number) => void;

    collections     : { [key : string] : Collection };
    getCollection   : (c : Principal) => Collection | undefined;
    fetchCollections: () => void;

    // TODO: replace with CAP implementation
    history     : { [key : string] : _Token[] };

    likes   : [CanisterId, TokenIndex][];
    like    : (token : [CanisterId, TokenIndex]) => void;
    unlike  : (token : [CanisterId, TokenIndex]) => void;

    isMinting       : boolean;
    setIsMinting    : (m : boolean) => void;
    mintResult?     : number;
    setMintResult   : (m : number | undefined) => void;
};

const isLocal = import.meta.env.PROGENITUS_IS_LOCAL === 'true';
const host = import.meta.env.PROGENITUS_IC_HOST as string;
const canisterId = import.meta.env.PROGENITUS_CANISTER_ID as string;
const nnsCanisterId = import.meta.env.PROGENITUS_NNS_CANISTER_ID as string;

const rosetta = 'https://rosetta-api.internetcomputer.org';
const mockAccount = '769b645e881a0f5cf8891c1714b8235130984d07dd0c6ccc2aa13076682fd4bb';

const NftActors : { [key : string] : ActorSubclass<MockNFT> } = {};

function getNftActor (canisterId : string) : ActorSubclass<MockNFT> {
    if (NftActors[canisterId]) {
        return NftActors[canisterId];
    } else {
        const actor = Actor.createActor<MockNFT>(nftIdl, {
            agent: defaultAgent,
            canisterId,
        });
        NftActors[canisterId] = actor;
        return actor;
    };
}

function rosettaData (account : string) {
    return {
        "network_identifier": {
            "blockchain": "Internet Computer",
            "network": "00000000000000020101",
        },
        "account_identifier": {
            "address": account,
        },
    };
}

// Create some fake mint history.
export interface Listing { id : number; canister : string; price : number; }

// Create a default agent
const defaultAgent = new HttpAgent({ host: 'https://boundary.ic0.app/' });

const defaultActor = Actor.createActor<Rex>(idlFactory, {
    agent: defaultAgent,
    canisterId,
});

const useStore = create<Store>((set, get) => ({

    defaultActor,

    history,

    // Wallets

    connected: false,
    connecting: false,

    idempotentConnect () {
        const { connecting } = get();
        if (connecting) return null;
        set({ connecting: true });
        return () => {
            set({ connecting: false });
        };
    },

    async stoicConnect () {

        const complete = get().idempotentConnect()
        if (complete === null) return;

        StoicIdentity.load().then(async (identity : any) => {
            if (identity !== false) {
              // ID is a already connected wallet!
            } else {
              // No existing connection, lets make one!
              identity = await StoicIdentity.connect();
            };

            const agent = new HttpAgent({
                identity,
                host,
            });

            isLocal && agent.fetchRootKey();

            // Create a progenitus actor
            const actor = Actor.createActor<Rex>(idlFactory, {
                agent,
                canisterId,
            });

            // Create an nns actor
            const nns = Actor.createActor<Ledger>(nnsIdl, {
                agent,
                canisterId: nnsCanisterId,
            });

            // Get account and balance after login
            actor.getPersonalAccount()
            .then(r => set({ address: buf2hex(new Uint8Array(r)) }))
            .then(() => get().fetchBalance());

            complete();
            set(() => ({ connected: true, principal: identity.getPrincipal(), actor, wallet: 'stoic', ledgerActor: nns }));
        });
    },

    async plugConnect () {

        const complete = get().idempotentConnect()
        if (complete === null) return;

        // If the user doesn't have plug, send them to get it!
        if (window?.ic?.plug === undefined) {
            window.open('https://plugwallet.ooo/', '_blank');
            return;
        }
        
        await window.ic.plug.requestConnect({ whitelist: [canisterId], host }).catch(complete);

        const agent = await window.ic.plug.agent;
        isLocal && agent.fetchRootKey();
        const principal = await agent.getPrincipal();

        const actor = await window?.ic?.plug?.createActor<Rex>({
            canisterId,
            interfaceFactory: idlFactory,
        });

        // Get account and balance after login
        actor.getPersonalAccount()
        .then(r => set({ address: buf2hex(new Uint8Array(r)) }))
        .then(() => get().fetchBalance());

        complete();
        set(() => ({ connected: true, principal, actor, wallet: 'plug' }));
    },

    disconnect () {
        StoicIdentity.disconnect();
        window.ic?.plug?.deleteAgent();
        set({ connected: false, principal: undefined, address: undefined, actor: undefined, balance: undefined, wallet: undefined, ledgerActor: undefined });
    },

    // Account

    fetchBalance () {
        const { address } = get();
        if (!address) return;
        axios.post(`${rosetta}/account/balance`, rosettaData(address))
            .then(r => {
                set({ balance : { e8s : parseInt(r.data.balances[0].value) } })
            })
    },

    balanceDisplay () {
        const { balance } = get();
        if (balance) {
            return balance.e8s / 10**8;
        } else {
            return undefined;
        }
    },

    async withdraw (amount : number) {

        const { actor, principal, pushMessage, fetchBalance } = get();

        if (!principal || !actor) return;
        
        const address = Object.values(principalToAccountIdentifier(principal)) as number[];

        return actor.transfer({ e8s: BigInt(amount.toFixed()) }, address)
        .catch(e => {
            console.error(e);
            pushMessage({ type: 'error', message: 'Transfer failed!'});
        })
        .then(r => {
            // @ts-ignore
            if (r?.Err) {
                pushMessage({
                    type: 'error',
                    // @ts-ignore
                    message: Object.keys(r.Err)[0],
                })
            } else {
                setTimeout(fetchBalance, 1000);
            }
        });
    },

    async deposit (amount : number) {

        const { address, wallet } = get();

        if (!address || !wallet) return;

        async function transferPlug (amount : number, to : string) {
            return window.ic?.plug?.requestTransfer({ to, amount })
            .catch(e => {
                console.error(e);
                get().pushMessage({ type: 'error', message: 'Transfer failed!'});
            })
            .then(() => void setTimeout(get().fetchBalance, 1000));
        };

        async function transferStoic (amount : number, to : string) {
            const { ledgerActor, pushMessage } = get();
            if (!ledgerActor) return;
            return ledgerActor.transfer({
                to: Array.from(hexStringToByteArray(to)),
                amount: { e8s: BigInt(amount.toFixed()) },
                memo: BigInt(0),
                fee: { e8s: BigInt(10_000) },
                from_subaccount: [],
                created_at_time: [],
            })
            .catch(e => {
                console.error(e);
                get().pushMessage({ type: 'error', message: 'Transfer failed!'});
            })
            .then(r => {
                console.log(r);
                // @ts-ignore
                if (r?.Err) {
                    pushMessage({
                        type: 'error',
                        // @ts-ignore
                        message: Object.keys(r.Err)[0],
                    })
                } else {
                    setTimeout(get().fetchBalance, 1000)
                }
            });
        };

        if (wallet === 'stoic') {
            return transferStoic(amount, address);
        } else {
            return transferPlug(amount, address);
        }
    },

    // Dev config

    isLocal,
    edges: false,
    setEdges: (edges) => set({ edges }),

    // Dark/Light Color Scheme

    colorScheme: getUserColorScheme(),
    setColorScheme (colorScheme) {
        set({ colorScheme });
        window.localStorage.setItem('prefers-color-scheme', colorScheme);
        document.querySelector('html')?.setAttribute('data-theme', colorScheme);
    },

    // Store init

    async init () {
        get().fetchBalance();
        get().fetchEvents();
        // get().fetchCollections();

        window.alert = (message : string) => {
            get().pushMessage({type: 'info', message})
        }

        // Get ICP to USD exchange rate
        const cycles : any = await Actor.createActor(CyclesDID, {
            agent: defaultAgent,
            canisterId: 'rkp4c-7iaaa-aaaaa-aaaca-cai',
        }).get_icp_xdr_conversion_rate();
        const xdr = await fetch("https://free.currconv.com/api/v7/convert?q=XDR_USD&compact=ultra&apiKey=df6440fc0578491bb13eb2088c4f60c7").then(r => r.json());

        const icpToUSD = Number(cycles.data.xdr_permyriad_per_icp) / 10000 * (xdr.hasOwnProperty("XDR_USD") ? xdr.XDR_USD : 1.4023);

        set({ defaultAgent, icpToUSD });
    },

    // Generic UI messages

    messages: {},

    pushMessage (message) {
        set(state => ({ messages: { ...state.messages, [Object.values(state.messages).length - 1]: message } }))
    },

    readMessage (i) {
        set(state => ({ messages: { ...state.messages, [i]: { ...state.messages[i], read: true } }}))
    },

    // NFT Actors

    getNftActor,

    // Events

    events : {},

    getEvent (canister, index) {
        const { events } = get();
        return events?.[canister]?.[index];
    },

    fetchEvents () {
        // Mock Events
        // set({ events: makeEvents() });

        // Real Events
        defaultActor.getAllEvents()
        .then(events => {
            set({ events: events.map(([p, e, i]) => mapEvent(p, e, i)).reduce((agg, e) => ({ ...agg, [e.collection.canister] : { ...agg[e.collection.canister], [e.id] : e } }), {} as EventsMap) });
        })
    },

    // Event Supply

    eventSupply: {},

    fetchSupply (canister, index) {
        const { eventSupply } = get();
        let n = { ...eventSupply };
        n?.[canister]?.[index]
        getNftActor(canister)
        .launchpadTotalAvailable(BigInt(index))
        .then(s => {
            n[canister] = n[canister] || {};
            n[canister][index] = Number(s);
            set({ eventSupply: n });
        });
    },

    // Collections

    collections : {},

    getCollection (canister) {
        return get().collections[canister.toString()];
    },

    fetchCollections () {
        set({ collections : makeCollections() });
    },

    // Tokens liked by the user

    likes: [],

    like (token) {
        set(state => ({
            likes: [...state.likes, token],
        }));
    },

    unlike (token) {
        set(state => ({
            likes: state.likes.filter(x => !(token[0] === x[0]) && !(token[1] === x[1])),
        }));
    },

    // Minting

    isMinting: false,
    setIsMinting (isMinting) { set({ isMinting }) },
    mintResult: undefined,
    setMintResult (mintResult) { set({ mintResult }) },

}));

export default useStore;

function getUserColorScheme () : ColorScheme {
    let scheme : ColorScheme = 'dark';

    const savedValue = window.localStorage.getItem('prefers-color-scheme');
    const sysPreferDark : boolean = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const sysPreferLight : boolean = window.matchMedia('(prefers-color-scheme: light)').matches;

    if (savedValue === 'dark') {
        scheme = 'dark';
    } else if (savedValue === 'light') {
        scheme = 'light';
    } else if (sysPreferDark) {
        scheme = 'dark';
    } else if (sysPreferLight) {
        scheme = 'light';
    }

    document.querySelector('html')?.setAttribute('data-theme', scheme);

    return scheme;
};

// This is the stuff that plug wallet extension stuffs into the global window namespace.
// I stole this for Norton: https://github.com/FloorLamp/cubic/blob/3b9139b4f2d16bf142bf35f2efb4c29d6f637860/src/ui/components/Buttons/LoginButton.tsx#L59
declare global {
    interface Window {
        ic?: {
            plug?: {
                agent: any;
                createActor: <T>(args : {
                    canisterId          : string,
                    interfaceFactory    : IDL.InterfaceFactory,
                }) => ActorSubclass<T>,
                isConnected : () => Promise<boolean>;
                createAgent : (args?: {
                    whitelist   : string[];
                    host?       : string;
                }) => Promise<undefined>;
                requestBalance: () => Promise<
                    Array<{
                        amount      : number;
                        canisterId  : string | null;
                        image       : string;
                        name        : string;
                        symbol      : string;
                        value       : number | null;
                    }>
                >;
                requestTransfer: (arg: {
                    to      : string;
                    amount  : number;
                    opts?   : {
                        fee?            : number;
                        memo?           : number;
                        from_subaccount?: number;
                        created_at_time?: {
                            timestamp_nanos: number;
                        };
                    };
                }) => Promise<{ height: number }>;
                requestConnect: (opts: any) => Promise<'allowed' | 'denied'>;
                deleteAgent: () => Promise<void>;
            };
        };
    }
}

function hexStringToByteArray(hexString : string) {
    if (hexString.length % 2 !== 0) {
        throw "Must have an even number of hex digits to convert to bytes";
    }
    var numBytes = hexString.length / 2;
    var byteArray = new Uint8Array(numBytes);
    for (var i=0; i<numBytes; i++) {
        byteArray[i] = parseInt(hexString.substr(i*2, 2), 16);
    }
    return byteArray;
}
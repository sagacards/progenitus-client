import create from 'zustand'
import { StoicIdentity } from "ic-stoic-identity";
import { ActorSubclass, HttpAgent } from '@dfinity/agent'
import { IDL } from '@dfinity/candid'
import { Principal } from '@dfinity/principal';
import axios from 'axios';

type ColorScheme = 'dark' | 'light';

interface Store {

    principal?      : Principal;
    connected       : boolean;
    connecting      : boolean;
    idempotentConnect: () => null | (() => void);
    stoicConnect    : () => void;
    plugConnect     : () => void;
    disconnect      : () => void;

    address?: string;
    balance?: number;
    fetchBalance: () => void;

    colorScheme: ColorScheme;
    setColorScheme: (c : ColorScheme) => void;

    isLocal : boolean;
    edges   : boolean;
    setEdges: (e : boolean) => void;

    init: () => void;

};

const isLocal = import.meta.env.PROGENITUS_IS_LOCAL === 'true';
const host = import.meta.env.PROGENITUS_IC_HOST as string;
const canisterId = import.meta.env.PROGENITUS_CANISTER_ID as string;

const rosetta = 'https://rosetta-api.internetcomputer.org';
const mockAccount = '769b645e881a0f5cf8891c1714b8235130984d07dd0c6ccc2aa13076682fd4bb';

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

const useStore = create<Store>((set, get) => ({

    // Wallets

    connected: false,
    connecting: false,

    idempotentConnect () {
        const { connecting } = get();
        if (connecting) return null;
        set({ connecting: true });
        return () => {
            set({ connecting: false, address: mockAccount });
            get().fetchBalance();
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

            // Create an actor canister
            // const actor = Actor.createActor<Canister>(idlFactory, {
            //     agent,
            //     canisterId,
            // });

            complete();
            set(() => ({ connected: true, principal: identity.getPrincipal() }));
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

        // const actor = await window?.ic?.plug?.createActor<Canister>({
        //     canisterId,
        //     interfaceFactory: idlFactory,
        // });

        complete();
        set(() => ({ connected: true, principal }));
    },

    disconnect () {
        StoicIdentity.disconnect();
        window.ic?.plug?.deleteAgent();
        set({ connected: false, principal: undefined, address: undefined });
    },

    // Account

    fetchBalance () {
        const { address } = get();
        if (!address) return;
        axios.post(`${rosetta}/account/balance`, rosettaData(address))
            .then(r => {
                set({ balance : parseInt(r.data.balances[0].value) / 10**8 })
            })
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

    init () {
        get().fetchBalance();
    }

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
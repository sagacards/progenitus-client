// A slice of the Bazaar store handling connection to the IC.

import { StoicIdentity } from 'ic-stoic-identity';
import { Principal } from '@dfinity/principal';
import { ActorSubclass, HttpAgent } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { CompleteStore, StoreSlice } from 'stores/index';
import { whitelist } from 'stores/actors';
import { toHexString } from 'ictool';

export const icConf = {
    protocol: (import.meta.env.PROGENITUS_IC_PROTOCOL as string) || 'https',
    host: (import.meta.env.PROGENITUS_IC_HOST as string) || 'ic0.app',
    isLocal: import.meta.env.PROGENITUS_IS_LOCAL === 'true',
};

export const host = `${icConf.protocol}://${icConf.host}`;

export const defaultAgent = new HttpAgent({ host });

export type Wallet = 'plug' | 'stoic' | 'earth' | 'ii';

export interface ICP8s {
    e8s: number;
}

export interface ConnectStore {
    initialized: boolean;
    initConnect: () => void;

    agent?: HttpAgent;

    connected: boolean;
    connecting: boolean;
    postConnect: () => Promise<void>;
    idempotentConnect: () => null | (() => void);
    plugConnect: () => void;
    stoicConnect: () => void;
    plugReconnect: () => Promise<boolean>;
    stoicReconnect: () => Promise<boolean>;

    walletBalance?: ICP8s;
    walletBalanceDisplay: () => number | undefined;

    disconnect: () => Promise<void>;

    principal?: Principal;
    wallet?: Wallet;
}

export const createConnectSlice: StoreSlice<ConnectStore, CompleteStore> = (
    set,
    get
) => ({
    // Boolean connection state
    connected: false,
    connecting: false,

    // Run once on startup should be called from the root store's init function.
    initialized: false,
    initConnect() {
        const { initialized, plugReconnect, stoicReconnect } = get();
        if (initialized) return;

        // Attempt to reconnect to wallets
        try {
            plugReconnect().then(r => {
                if (!r) stoicReconnect();
            });
        } catch (e) {
            console.error(e);
        }

        set({ initialized: true });
    },

    // Ensures only one connection attempt when implemented properly.
    idempotentConnect() {
        const { connecting } = get();
        if (connecting) return null;
        set({ connecting: true });
        return () => {
            set({ connecting: false });
        };
    },

    // Request connection to user's stoic wallet.
    async stoicConnect() {
        const { idempotentConnect, postConnect } = get();

        // Ensure singular connection attempt.
        const complete = idempotentConnect();
        if (complete === null) return;

        StoicIdentity.load()
            .then(async (identity: any) => {
                if (!identity) {
                    identity = await StoicIdentity.connect();
                }

                const agent = new HttpAgent({
                    identity,
                    host,
                });

                set(() => ({
                    agent,
                    connected: true,
                    principal: identity.getPrincipal(),
                    wallet: 'stoic',
                }));

                postConnect();
            })
            .finally(complete);
    },

    // Request connection to user's plug wallet.
    async plugConnect() {
        const { idempotentConnect, postConnect } = get();

        // Ensure singular connection attempt.
        const complete = idempotentConnect();
        if (complete === null) return;

        // If the user doesn't have plug, send them to get it!
        if (window?.ic?.plug === undefined) {
            window.open('https://plugwallet.ooo/', '_blank');
            return;
        }

        await window.ic.plug.requestConnect({ whitelist, host });
        const agent = await window.ic.plug.agent;
        const principal = await agent.getPrincipal();

        complete();
        set(() => ({ connected: true, principal, wallet: 'plug' }));
        postConnect();
    },

    // Attempt to restore a live connection to user's plug wallet.
    async plugReconnect() {
        const { postConnect } = get();
        const plug = window?.ic?.plug;
        if (
            (await plug?.isConnected()) &&
            window.localStorage.getItem('wallet') === 'plug'
        ) {
            const agent = await plug?.agent;

            if (!agent) {
                await plug?.createAgent({ host, whitelist });
            }

            const principal = await plug?.agent?.getPrincipal();

            set(() => ({ connected: true, principal, wallet: 'plug' }));
            postConnect();

            return true;
        }
        return false;
    },

    // Attempt to restore a live connection to user's stoic wallet.
    async stoicReconnect() {
        const { stoicConnect } = get();
        if (
            window.localStorage.getItem('_scApp') &&
            window.localStorage.getItem('wallet') === 'stoic'
        ) {
            stoicConnect();
            return true;
        }
        return false;
    },

    // Things that happen after a wallet connection.
    async postConnect() {
        const { wallet, createActors } = get();

        // Track connected wallet
        wallet && window.localStorage.setItem('wallet', wallet);

        // Update identity on actors
        await createActors();

        const {
            fetchBalance,
            actors: { bazaar },
            fetchLikes,
        } = get();

        // Fetch user's likes
        fetchLikes();

        // Fetch and update personal minting account address
        const address = toHexString(await bazaar.getPersonalAccount());
        set({ address });

        // Update account balance
        fetchBalance();
    },

    // Disconnect from users wallet.
    async disconnect() {
        const { createActors } = get();
        StoicIdentity.disconnect();
        window.ic?.plug?.deleteAgent && window.ic?.plug?.deleteAgent();
        set({
            connected: false,
            principal: undefined,
            wallet: undefined,
            agent: undefined,
        });
        window.localStorage.removeItem('wallet');
        await createActors();
    },

    // Display-ready wallet balance.
    walletBalanceDisplay() {
        const { walletBalance: balance } = get();
        if (balance) {
            return balance.e8s / 10 ** 8;
        } else {
            return undefined;
        }
    },
});

// This is the stuff that plug wallet extension stuffs into the global window namespace.
// I stole this for Norton: https://github.com/FloorLamp/cubic/blob/3b9139b4f2d16bf142bf35f2efb4c29d6f637860/src/ui/components/Buttons/LoginButton.tsx#L59
declare global {
    interface Window {
        ic?: {
            plug?: {
                agent: any;
                createActor: <T>(args: {
                    canisterId: string;
                    interfaceFactory: IDL.InterfaceFactory;
                }) => Promise<ActorSubclass<T>>;
                isConnected: () => Promise<boolean>;
                createAgent: (args?: {
                    whitelist: string[];
                    host?: string;
                }) => Promise<undefined>;
                requestBalance: () => Promise<
                    Array<{
                        amount: number;
                        canisterId: string | null;
                        image: string;
                        name: string;
                        symbol: string;
                        value: number | null;
                    }>
                >;
                requestTransfer: (arg: {
                    to: string;
                    amount: number;
                    opts?: {
                        fee?: number;
                        memo?: number;
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

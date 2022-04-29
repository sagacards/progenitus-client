import create from 'zustand';
import { persist } from 'zustand/middleware';
import { getAllNFTS, DABCollection } from '@psychedelic/dab-js';
import { CapRouter, CapRoot, Hosts  } from '@psychedelic/cap-js';
import { Principal } from '@dfinity/principal';
import { parseGetTransactionsResponse, Transaction } from '../logic/transactions';
import Icon from 'assets/disk/8.png'

// Instead of relying on DAB, we'll hard code the collections that we're interested in for now
const collections = {
    "dklxm-nyaaa-aaaaj-qajza-cai": {
        icon: Icon,
        name: 'Legends Test',
        description: 'A Test Canister',
        // @ts-ignore: different versions of @dfinity/principal in this package, @psychedelic/cap-js and @psychedelic/dab-js...
        principal_id: Principal.fromText('dklxm-nyaaa-aaaaj-qajza-cai'),
        standard: 'ext',
    },
    "zzk67-giaaa-aaaaj-qaujq-cai": {
        icon: Icon,
        name: 'The High Priestess',
        description: '',
        // @ts-ignore: different versions of @dfinity/principal in this package, @psychedelic/cap-js and @psychedelic/dab-js...
        principal_id: Principal.fromText('zzk67-giaaa-aaaaj-qaujq-cai'),
        standard: 'ext',
    },
    "5t24r-yqaaa-aaaaj-qauta-cai": {
        icon: Icon,
        name: 'The Empress',
        description: '',
        principal_id: Principal.fromText('5t24r-yqaaa-aaaaj-qauta-cai'),
        standard: 'ext',
    },
};

const DAB_UPDATE_INTERVAL = 1000 * 60 * 10;
const TRANSACTION_LIMIT = 100;

const TimeFormatter = new Intl.RelativeTimeFormat('en', { style: 'long' });

type CanisterId = string;

interface Store {

    dab: { [key : CanisterId] : DABCollection },
    dabFetch: (force?: boolean) => void;
    dabLastFetch: Date;

    cap: { [key : CanisterId] : Transaction[] };
    capRoots: { [key : string] : Principal };
    capFetchRoots: () => void;
    capPoll: (tokenCanister : string) => void;
    capFetch: (tokenCanister : string) => void;


    filters: Principal[];
    filtersSet: (canisters : Principal[]) => void;
    filtersAdd: (canisters: Principal[]) => void;
    filtersRemove: (canisters: Principal[]) => void;
    filtersToggle: (canister: Principal) => void;
    filtersReset: () => void;
};

const capIsPolling: {[key : string] : boolean | undefined} = {};

export const useTokenStore = create<Store>(

        (set, get) => ({


            //////////
            // DAB //
            ////////
            // DAB is our directory of all NFT canisters on the IC.


            // Our local list of NFT canisters.
            // @ts-ignore: principal lib mistmatch
            dab: collections,

            // Last DAB update time, so we can throttle updates.
            dabLastFetch: new Date(0),

            // Fetch lastest NFT canister list from DAB.
            // NOTE: Call this from your view to start populating data. I should probably move data initialization into the store.
            dabFetch: (force = false) => {

                console.error(`We're using a hardcoded set of collections.`);
                return;

                // Limit updates to the DAB local collection.
                const { dabLastFetch, capFetchRoots } = get();
                const now = new Date();
                console.info(`Last DAB update: ${TimeFormatter.format((dabLastFetch.getTime() - now.getTime()) / 1000 / 60, 'minutes')}`);
                if (!force && now.getTime() - dabLastFetch.getTime() < DAB_UPDATE_INTERVAL) {
                    console.info(`Skipping DAB sync, last fetch is within acceptable interval.`);
                    return;
                };

                // Fetch latest collection from DAB.
                getAllNFTS().then(collections => {
                    set(state => ({
                        dab: collections.reduce((agg, i) => ({
                            ...agg,
                            [i.principal_id.toText()] : i,
                        }), {}),
                        dabLastFetch: new Date(),
                    }));
                    // We have all the NFT canisters in our store now, so let's go get the CAP root bucket for each.
                    capFetchRoots();
                });
            },


            //////////
            // CAP //
            ////////
            // CAP is our source of transaction data for each NFT canister.

            // Local list of transactions.
            cap: {},

            // Local map of canister ids to their cap root buckets.
            capRoots: {},

            // Retrieve the root bucket which tracks transactions for each of the available NFT canisters.
            async capFetchRoots () {
                const { dab, capRoots : knownRoots, capPoll } = get();
                const witness = false;
                // Root buckets won't really change in the normal course of action, so if we have a bucket for a canister, we don't need to bother checking again. That will save an IC call per NFT canister, which would add up.
                // NOTE: There doesn't seem to be a bulk query method.
                await Promise.all(
                    Object.values(dab).filter(x => !Object.values(knownRoots).includes(
                        // @ts-ignore: different versions of @dfinity/principal in this package, @psychedelic/cap-js and @psychedelic/dab-js...
                        x.principal_id
                    ))
                    .map(async (x) => (await CapRouter.init({})).get_token_contract_root_bucket({
                        // @ts-ignore: different versions of @dfinity/principal in this package, @psychedelic/cap-js and @psychedelic/dab-js...
                        tokenId: x.principal_id,
                        witness,
                    }).then(r => ({
                        [x.principal_id.toText()]: r.canister[0] as Principal | undefined
                    })))
                ).then((results) => {
                    const capRoots = results.reduce((agg, root) => {
                        if (Object.values(root)[0] === undefined) {
                            return agg;
                        } else {
                            return { ...agg, ...root };
                        };
                    }, knownRoots) as { [key : string] : Principal };
                    set({ capRoots });
                    Object.keys(capRoots).forEach(x => capPoll(x))
                });
            },

            // Start polling for transaction events from the given token canister.
            async capPoll (tokenCanister : string) {
                const { dab, capRoots } = get();
                const collection = dab[tokenCanister];
                const rootPrincipal = capRoots[tokenCanister];
                if (!rootPrincipal) {
                    console.error(`Can't poll transactions on ${tokenCanister}, root bucket unknown.`);
                    return;
                };

                // We don't want to be polling the same bucket more than once.
                if (capIsPolling[tokenCanister]) return;
                capIsPolling[tokenCanister] = true;
                
                // @ts-ignore: typescript definitions for cap-js are just wrong...
                const root = await CapRoot.init({
                    canisterId: rootPrincipal.toText()
                });

                // Recursive polling function
                async function poll () {
                    const { filters } = get();

                    // Query the history canister.
                    const response = await Promise.all([
                        root.get_transactions({ witness: false }),
                        root.get_transactions({ witness: false, page: 2 }),
                    ]);
                    const transactions = parseGetTransactionsResponse(response.reduce((agg, i) => ({ data: [...agg.data, ...i.data]}), {data : [] as TransitionEvent[]}) ) as Transaction[];

                    set(state => ({ cap: {
                        ...state.cap,
                        [tokenCanister] : transactions,
                    } }));

                    if (filters.length === 0 || filters.map(x => x.toText()).includes(tokenCanister)) {
                        // Keep polling
                        setTimeout(poll, 5000);
                    } else {
                        capIsPolling[tokenCanister] = false;
                    }
                };

                poll();
            },


            //////////////
            // Filters //
            ////////////
            // Filters are a control state that allows filtering down visible data.


            // Empty / default should be assumed to indiciate a "show all" state.
            filters: [],

            // Remove all filters.
            // NOTE: I have a feeling that nesting functions like this is probably inefficient because I'm replacing the parent object, but we're really not calling these parts of the store very often and I like the interface it creates.
            filtersReset() {
                set(state => ({
                    filters: [],
                }));
            },

            filtersSet (filters) {
                set({ filters });
            },

            // Add canisters to the filter list.
            filtersAdd(canisters: Principal[]) {
                console.info(`Add filters`, canisters);
                set(state => ({
                    filters: [
                        ...state.filters,
                        ...canisters,
                    ],
                }));
            },

            // Remove canisters from the filter list.
            filtersRemove(canisters: Principal[]) {
                console.info(`Remove filters`, canisters);
                set(state => ({
                    filters: state.filters.filter(x => !canisters.includes(x)),
                }));
            },

            // Toggles the state of a single filter.
            filtersToggle(canister: Principal) {
                if (get().filters.includes(canister)) {
                    get().filtersRemove([canister]);
                } else {
                    get().filtersAdd([canister]);
                };
            },

        }),

);
// DAB is a canister service which acts as a directory for NFTs. Saga has it's own DAB service, which we query for a list of all available tarot NFTs.

import { Actor } from '@dfinity/agent';
import { useQuery } from 'react-query';

import { Metadata, TarotDAB } from 'canisters/tarot-dab/tarot-dab.did.d';
import { idlFactory } from 'canisters/tarot-dab/tarot-dab.did';

import { defaultAgent } from 'stores/connect';

////////////
// Types //
//////////

type Entry = Omit<Metadata, 'details' | 'principal_id' | 'frontend'>;

interface LegendEntry extends Entry {
    artists: string;
    principal: string;
    isDeck: boolean;
}

//////////////
// Mapping //
////////////

// Maps an entry from the DAB registry for use in this app.
function mapDabCanister(entry: Metadata): LegendEntry {
    const details = Object.fromEntries(entry.details);
    return {
        name: entry.name,
        thumbnail: entry.thumbnail
            // hack to support google drive setup
            .replace('file/d/', 'uc?id=')
            .replace('/view?usp=sharing', ''),
        description: entry.description,
        // Principal objects don't survive localstorage, so we text encode here.
        principal: entry.principal_id.toText(),
        // @ts-ignore: TODO improve this
        artists: details.artists.Text,
        // @ts-ignore: TODO improve this
        isDeck: details?.isDeck?.Text === 'true',
    };
}

///////////////
// Fetching //
/////////////

// Just a plain actor we can use to make requests.
const actor = Actor.createActor<TarotDAB>(idlFactory, {
    agent: defaultAgent,
    canisterId: import.meta.env.PROGENITUS_DAB_CANISTER_ID,
});

// Retrieve all tarot NFTS.
function getAll() {
    return actor.getAll().then(r => r.map(mapDabCanister));
}

////////////
// Hooks //
//////////

// The hook providing our tarot NFT registry.
export function useTarotDAB() {
    return useQuery('dab', getAll, {
        cacheTime: 7 * 24 * 60 * 60_000,
        staleTime: 60 * 60_000,
    });
}
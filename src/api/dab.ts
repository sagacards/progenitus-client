// DAB is a canister service which acts as a directory for NFTs. Saga has it's own DAB service, which we query for a list of all available tarot NFTs.

import { Actor } from '@dfinity/agent';
import { useQuery } from 'react-query';

import { Metadata, TarotDAB } from 'canisters/tarot-dab/tarot-dab.did.d';
import { idlFactory } from 'canisters/tarot-dab/tarot-dab.did';

import { agent } from 'api/actors';

////////////
// Types //
//////////

type Entry = Omit<Metadata, 'details' | 'principal_id' | 'frontend'>;

export interface LegendEntry extends Entry {
    name: string;
    thumbnail: string;
    description: string;
    artists: string;
    principal: string;
    isDeck: boolean;
    previewImage?: string;
    bannerImage?: string;
}

//////////////
// Mapping //
////////////

// hack to support google drive setup.
function driveHack(url: string) {
    return url.replace('file/d/', 'uc?id=').replace('/view?usp=sharing', '');
}

// Maps an entry from the DAB registry for use in this app.
function mapDabCanister(entry: Metadata): LegendEntry {
    const details = Object.fromEntries(entry.details);
    return {
        name: entry.name,
        thumbnail: driveHack(entry.thumbnail),
        description: entry.description,
        principal: entry.principal_id.toText(),
        // @ts-ignore: TODO improve this
        artists: details.artists.Text,
        // @ts-ignore: TODO improve this
        isDeck: details?.isDeck?.Text === 'true',
        // @ts-ignore: TODO improve this
        previewImage: driveHack(details?.preview_image.Text),
        // @ts-ignore: TODO improve this
        bannerImage: driveHack(details?.banner_image.Text),
    };
}

///////////////
// Fetching //
/////////////

// Just a plain actor we can use to make requests.
const actor = Actor.createActor<TarotDAB>(idlFactory, {
    agent,
    canisterId: import.meta.env.PROGENITUS_DAB_CANISTER_ID,
});

// Retrieve all tarot NFTS.
export function getAll() {
    return actor.getAll().then(r => r.map(mapDabCanister));
}

////////////
// Hooks //
//////////

// The hook providing our tarot NFT registry.
export function useDirectory() {
    return useQuery('dab', getAll, {
        cacheTime: 7 * 24 * 60 * 60_000,
        staleTime: 60 * 60_000,
    });
}

// Hook providing details on the given canister
export function useCanisterDetails(canister: string) {
    return useQuery('dab', getAll, {
        cacheTime: 7 * 24 * 60 * 60_000,
        staleTime: 60 * 60_000,
    }).data?.find(x => x.principal === canister);
}

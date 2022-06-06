import React from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { icConf } from 'stores/index';
import { ic, legend } from './actors/actors';
import { useQueries, useQuery } from 'react-query';
import { useDirectory } from './dab';

////////////
// Types //
//////////

export interface LegendManifest {
    back: string;
    border: string;
    ink: string;
    maps: {
        normal: string;
        layers: [string];
        back: string;
        border: string;
        background: string;
        mask?: string;
    };
    colors: {
        base: string;
        specular: string;
        emissive: string;
        background: string;
    };
    stock: {
        base: string;
        specular: string;
        emissive: string;
    };
    views: {
        flat: string;
        sideBySide: string;
        animated: string;
        interactive: string;
    };
}

export interface LegendTextures {
    back: THREE.Texture;
    border: THREE.Texture;
    normal: THREE.Texture;
    layers: THREE.Texture[];
}

//////////////
// Mapping //
////////////

interface Stats {
    saleVolume: number;
    largestSale: number;
    smallestSale: number;
    floor: number;
    listings: number;
    supply: number;
    sales: number;
}

export function mapStats(
    stats: [bigint, bigint, bigint, bigint, bigint, bigint, bigint]
): Stats {
    return {
        saleVolume: Number(stats[0]),
        largestSale: Number(stats[1]),
        smallestSale: Number(stats[2]),
        floor: Number(stats[3]),
        listings: Number(stats[4]),
        supply: Number(stats[5]),
        sales: Number(stats[6]),
    };
}

///////////////
// Fetching //
/////////////

// Retrieve fixed supply for all canisters.
export function useSupplyAll() {
    // Retrieve all tarot NFT canisters.
    const { data: canisters } = useDirectory();

    return useQueries(
        canisters?.map(c => ({
            queryKey: `${c.principal}-supply`,
            queryFn: async () => {
                return {
                    id: c.principal,
                    stats: mapStats(await legend(c.principal).stats()),
                };
            },
            cacheTime: 30 * 24 * 60 * 60_000,
            staleTime: 30 * 24 * 60 * 60_000,
        })) || []
    ).reduce<{ complete?: boolean; data: { [key: string]: number } }>(
        (agg, query) => {
            if (query.data) {
                return {
                    complete: agg?.complete === false ? false : query.isSuccess,
                    data: {
                        ...agg.data,
                        [query.data.id]: Number(query.data.stats.supply),
                    },
                };
            } else {
                return agg;
            }
        },
        { data: {} }
    );
}

// Retrieve markdown format long description from a legend canister.
export async function fetchDescriptionMarkdown(canisterId: string) {
    return (
        await fetch(
            `${icConf.protocol}://${canisterId}.raw.${icConf.host}/assets/description.md`
        )
    ).text();
}

export function useDescriptionMarkdown(canisterId: string) {
    return useQuery(`description-markdown-${canisterId}`, () =>
        fetchDescriptionMarkdown(canisterId)
    );
}

export function useUnminted() {
    // Retrieve all tarot NFT canisters.
    const { data: canisters } = useDirectory();

    const supply = useSupplyAll();

    // Retrieve registries for all canisters.
    const query = useQueries(
        canisters?.map(c => ({
            queryKey: `${c.principal}-registry`,
            queryFn: async () => ({
                id: c.principal,
                canister: c,
                registry: await legend(c.principal).getRegistry(),
                supply: supply?.data?.[c.principal],
            }),
            cacheTime: 24 * 60 * 60_000,
            staleTime: 60_000,
            enabled: supply.complete,
        })) || []
    );

    const registries = React.useMemo(
        () =>
            query.reduce<{
                [key: string]: {
                    minted?: number;
                    data: any;
                    supply: number;
                    unminted: number;
                };
            }>((agg, { data }) => {
                if (data) {
                    return {
                        ...agg,
                        [data.id]: {
                            minted: data.registry?.length,
                            data: data.canister,
                            supply: supply?.data?.[data.id],
                            unminted:
                                supply?.data?.[data.id] - data.registry?.length,
                        },
                    };
                } else {
                    return agg;
                }
            }, {}),
        [query, supply]
    );

    return registries;
}

export function fetchLegend(canister: string, index: number) {
    return fetchLegendManifest(canister, index).then(manifest =>
        fetchLegendTextures(canister, manifest)
    );
}

export function fetchLegendManifest(
    canister: string,
    index: number
): Promise<LegendManifest> {
    return fetch(
        `${icConf.protocol}://${canister}.raw.${icConf.host}/${index}.json`
    ).then(r => r.json() as unknown as LegendManifest);
}

export function fetchTexture(
    canister: string,
    filename: string
): THREE.Texture {
    return useLoader(
        THREE.TextureLoader,
        `${icConf.protocol}://${canister}.raw.${icConf.host}/${filename}`
    );
}

export function fetchLegendTextures(
    canister: string,
    manifest: LegendManifest
) {
    return {
        back: fetchTexture(canister, manifest.maps.back),
        border: fetchTexture(canister, manifest.maps.border),
        normal: fetchTexture(canister, manifest.maps.normal),
        face: fetchTexture(canister, manifest.views.flat),
    };
}

import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { icConf } from 'stores/index';

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

///////////////
// Fetching //
/////////////

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

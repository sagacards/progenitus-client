import * as THREE from 'three';
import { useLoader } from "@react-three/fiber";
import { ic } from "stores/index";

export function fetchLegend (
    canister: string,
    index   : number,
) {
    return fetchLegendManifest(canister, index)
    .then(manifest => fetchLegendTextures(canister, manifest))
}

export function fetchLegendManifest (
    canister    : string,
    index       : number,
) : Promise<LegendManifest> {
    return fetch(`${ic.protocol}://${canister}.raw.${ic.host}/${index}.json`)
        .then(r => r.json() as unknown as LegendManifest);
};

export function fetchTexture (
    canister    : string,
    filename    : string,
) : THREE.Texture {
    return useLoader(THREE.TextureLoader, `${ic.protocol}://${canister}.raw.${ic.host}/${filename}`);
};

export function fetchLegendTextures (
    canister: string,
    manifest: LegendManifest,
) {
    return {
        back        : fetchTexture(canister, manifest.maps.back),
        border      : fetchTexture(canister, manifest.maps.border),
        normal      : fetchTexture(canister, manifest.maps.normal),
        face        : fetchTexture(canister, manifest.views.flat),
    };
}

export interface LegendManifest {
    back    : string;
    border  : string;
    ink     : string;
    maps    : {
        normal      : string;
        layers      : [string];
        back        : string;
        border      : string;
    };
    colors  : {
        base        : string;
        specular    : string;
        emissive    : string;
    };
    views   : {
        flat        : string;
        sideBySide  : string;
        animated    : string;
        interactive : string;
    }
};

export interface LegendTextures {
    back: THREE.Texture;
    border: THREE.Texture;
    normal: THREE.Texture;
    layers: THREE.Texture[];
}
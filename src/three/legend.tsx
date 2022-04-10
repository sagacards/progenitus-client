import * as THREE from 'three';
import React from 'react';
import { animated, useSpring, useSpringRef } from '@react-spring/three';
import { cardSpringConf } from './springs';
import { fetchLegend, fetchLegendManifest, LegendManifest, LegendTextures } from 'src/apis/legends';
import useStore, { ic } from 'stores/index';
import CardInk from './ink';
import { useLoader } from '@react-three/fiber';
import { useCardGeometry } from './geometry';

export function Legend () {

    // Store

    const { mintResult } = useStore();

    // Constants

    const colors = React.useMemo(() => [
        new THREE.Color('#0C0C0C').convertSRGBToLinear(),
        new THREE.Color('#0C0C0C').convertSRGBToLinear(),
        new THREE.Color('#0C0C0C').convertSRGBToLinear(),
    ], []);

    // Textures

    const [textures, setTextures] = React.useState<LegendManifest>();

    React.useEffect(() => {
        if (!mintResult) {
            setTextures(undefined);
            return;
        };
        void fetchLegendManifest('cwu5z-wyaaa-aaaaj-qaoaq-cai', mintResult)
        .then(setTextures)
        .catch(console.error);
    }, [mintResult]);

    const border = textures?.border ? useLoader(THREE.TextureLoader, `${ic.protocol}://cwu5z-wyaaa-aaaaj-qaoaq-cai.raw.${ic.host}${textures.maps.border}`) : undefined;
    const back = textures?.back ? useLoader(THREE.TextureLoader, `${ic.protocol}://cwu5z-wyaaa-aaaaj-qaoaq-cai.raw.${ic.host}${textures.maps.back}`) : undefined;

    // State

    const [flip, setFlip] = React.useState(false);

    // Spring

    const springProps = useSpring({
        position: [0, .125, .5],
        rotation: [0, flip ? Math.PI : 0, 0],
        config: cardSpringConf,
    });

    // @ts-ignore
    return <animated.group {...springProps} onClick={() => setFlip(!flip)}>
        <mesh rotation={[0, Math.PI, 0]} geometry={useCardGeometry()}>
            <meshStandardMaterial attach="material" color={"green"} />
                {/* <meshPhongMaterial
                    attachArray="material"
                    color={colors[0]}
                    emissive={colors[1]}
                    specular={colors[2]}
                    emissiveIntensity={0.125}
                    shininess={200}
                    normalMap={textures?.normal}
                    // @ts-ignore
                    normalScale={[0.03, 0.03]}
                /> */}
                <meshStandardMaterial
                    blending={THREE.NormalBlending}
                    attachArray="material"
                    // map={textures?.layers[0]}
                    color={'yellow'}
                />
        </mesh>
        {/* <mesh position={[0, 0, 0.026]}>
            <planeGeometry args={[2.75, 4.75]} />
            <meshPhongMaterial
                // alphaMap={cover}
                transparent={true}
                color={'#121212'}
                // @ts-ignore
                specular={'#121212'}
                // @ts-ignore
                emissive={'#121212'}
                emissiveIntensity={0.125}
                shininess={100}
            />
        </mesh> */}
        <CardInk
            color={'red'}
            emissive={'red'}
            specular={'red'}
            side={THREE.FrontSide}
            alpha={border}
            shininess={200}
        />
        <CardInk
            color={'blue'}
            emissive={'blue'}
            specular={'blue'}
            side={THREE.BackSide}
            alpha={back}
        />
    </animated.group>;
};
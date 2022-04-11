import * as THREE from 'three';
import React from 'react';
import { animated, useSpring, useSpringRef } from '@react-spring/three';
import { cardSpringConf } from './springs';
import { fetchLegend, fetchLegendManifest, LegendManifest, LegendTextures } from 'src/apis/legends';
import useStore, { ic } from 'stores/index';
import CardInk from './ink';
import { useLoader } from '@react-three/fiber';
import { useCardGeometry } from './geometry';

export function Legend ({ colors, ...props } : { back : string, border : string, face : string, colors : { base : string; specular : string; emissive: string;} }) {

    const border = useLoader(THREE.TextureLoader, props.border);
    const back = useLoader(THREE.TextureLoader, props.back);
    const face = useLoader(THREE.TextureLoader, props.face);

    // Store

    const { mintResult } = useStore();

    // Constants

    const stock = React.useMemo(() => [
        new THREE.Color('#121212').convertSRGBToLinear(),
        new THREE.Color('#121212').convertSRGBToLinear(),
        new THREE.Color('#121212').convertSRGBToLinear(),
    ], []);

    const ink = React.useMemo(() => [
        new THREE.Color(colors.base).convertSRGBToLinear(),
        new THREE.Color(colors.emissive).convertSRGBToLinear(),
        new THREE.Color(colors.specular).convertSRGBToLinear(),
    ], []);

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
        <mesh rotation={[0, 0, 0]} geometry={useCardGeometry()}>
            <meshPhongMaterial
                attach="material-0"
                color={stock[0]}
                emissive={stock[1]}
                specular={stock[2]}
            />
            <meshPhongMaterial
                attach="material-1"
                color={stock[0]}
                emissive={stock[1]}
                specular={stock[2]}
            />
            <meshStandardMaterial
                attach="material-2"
                map={face}
                roughness={100}
                metalness={1.2}
            />
        </mesh>
        {/* Cover */}
        {/* <mesh position={[0, 0, 0.026]}>
            <planeGeometry args={[2.75, 4.75]} />
            <meshPhongMaterial
                // alphaMap={cover}
                transparent={true}
                color={stock[0]}
                // @ts-ignore
                specular={stock[1]}
                // @ts-ignore
                emissive={stock[2]}
                emissiveIntensity={0.125}
                shininess={100}
            />
        </mesh> */}
        <CardInk
            color={ink[0]}
            emissive={ink[1]}
            specular={ink[2]}
            side={THREE.FrontSide}
            alpha={border}
        />
        <CardInk
            color={ink[0]}
            emissive={ink[1]}
            specular={ink[2]}
            side={THREE.BackSide}
            alpha={back}
        />
    </animated.group>;
};
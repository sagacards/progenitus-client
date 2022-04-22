import * as THREE from 'three';
import React from 'react';
import { animated, useSpring, useSpringRef } from '@react-spring/three';
import { cardMovementSpringConf, cardSpringConf } from './springs';
import { LegendManifest } from 'src/apis/legends';
import CardInk from './ink';
import { createPortal, ThreeEvent, useFrame, useLoader, useThree } from '@react-three/fiber';
import { useCardGeometry } from './geometry';

////////////////////////
// The Parallax Card //
//////////////////////


const d = [2681, 4191]; // Dimensions of the art assets
const e = 1.41 / 1000; // Factor to normalize art assets to tarot card dimensions
const f = [2.75, 4.75]; // Tarot card dimensions
    
// Layers comprising the card face, layed out on the Z axis.
function CardArt(props: { textures: THREE.Texture[] }) {
    const scale = 1;
    const geometry = React.useMemo(() => new THREE.PlaneGeometry(d[0] * e * scale, d[1] * e * scale), [scale]);
    return (
        <group>
            {props.textures.map((t, i) => <mesh position={[0, 0, (-20 / props.textures.length) * i]} key={`tex${i}`} geometry={geometry}>
                <meshStandardMaterial transparent={true} map={t} />
            </mesh>)}
            <ambientLight intensity={.5} />
        </group>
    );
};

// Renders card art onto card mesh using default camera and a portal to create the depth effect.
export function Legend ({ manifest, canister } : { canister: string, manifest : LegendManifest }) {

    // Legends traits
    const { layers, colorBase, colorSpecular, colorEmissive, colorBackground, stockBase, stockSpecular, stockEmissive, normal, mask, back, border } = React.useMemo(() => {
        const [colorBase, colorSpecular, colorEmissive, colorBackground] = useLegendColors(canister, manifest);
        const [stockBase, stockSpecular, stockEmissive] = useLegendStock(canister, manifest);
        const normal = useLegendNormal(canister, manifest);
        const mask = useLegendMask(canister, manifest);
        const back = useLegendBack(canister, manifest);
        const border = useLegendBorder(canister, manifest);
        const layers = useLegendLayers(canister, manifest);
        return { layers, colorBase, colorSpecular, colorEmissive, colorBackground, stockBase, stockSpecular, stockEmissive, normal, mask, back, border };
    }, [manifest]);

    // Refs
    const scene = React.useRef(new THREE.Scene());
    const target = React.useRef(new THREE.WebGLRenderTarget(d[0], d[1]));
    const camera = React.useRef(new THREE.OrthographicCamera(-f[0] / 2, f[0] / 2, f[1] / 2, -f[1] / 2));
    React.useEffect(() => void (camera.current.position.z = 20), []);
    const mesh = React.useRef<THREE.Group>(null);
    const clock = React.useRef({
        tick: 0,
        lastTick: 0,
        tps: 10,
        elapsed: 0,
        prevElapsed: 0,
        animOffset: 0,
        slowFrames: 0,
    });
    const mouse = React.useRef({
        x: 0,
        y: 0,
        hover: false
    })

    // State
    const [flip, setFlip] = React.useState(false);

    // Animation
    const spring = useSpringRef();
    const springProps = useSpring({
        ref: spring,
        rotation: [
            THREE.MathUtils.degToRad(0 + mouse.current.y * 5),
            (flip ? 0 : Math.PI) - THREE.MathUtils.degToRad(mouse.current.x * 5),
            0
        ] as unknown as THREE.Vector3,
        position: [0, 0, mouse.current.hover ? 0.6 : 0.5] as unknown as THREE.Euler,
        config: {
            mass: 10,
            tension: 300,
            friction: 85
        }
    });
    const hoverBox = React.useMemo(() => new THREE.Box3(), []);
    function hoverTilt(e: ThreeEvent<PointerEvent>) {
        hoverBox.setFromObject(e.eventObject);
        mouse.current.x = e.point.x >= 0 ? e.point.x / hoverBox.max.x : -e.point.x / hoverBox.min.x;
        mouse.current.y = e.point.y >= 0 ? e.point.y / hoverBox.max.y : -e.point.y / hoverBox.min.y;
    }
    const cardProps = {
        ...springProps,
        onPointerMove: hoverTilt,
        onPointerEnter: () => mouse.current.hover = true,
        onPointerLeave: () => {
            mouse.current.hover = false;
            mouse.current.x = 0;
            mouse.current.y = 0;
        },
        onClick: () => {
            setFlip(!flip);
        },
    };

    // Configure performance regression
    const { regress } = useThree(state => ({
        regress: state.performance.regress,
        performance: state.performance.current
    }));

    useFrame((state) => {
        if (!mesh.current) return;

        // Update clock
        const t = state.clock.getElapsedTime();
        const c = clock.current;
        c.prevElapsed = c.elapsed;
        c.elapsed = t;

        // Regress quality based on subsequent slow frame renders
        const fps = 1 / (c.elapsed - c.prevElapsed);
        if (fps < 15) {
            c.slowFrames++;
            regress();
        } else {
            c.slowFrames = 0;
        }

        // Dynamically set pixel density based on performance
        if (state.performance.current < 1) {
            state.setDpr(1);
        } else {
            state.setDpr(window.devicePixelRatio);
        }

        // Position camera
        const ry = mesh.current.rotation.y % Math.PI;
        const cy = THREE.MathUtils.clamp(
            ry > Math.PI / 2 ? ry - Math.PI : ry,
            -Math.PI,
            Math.PI
        ) / Math.PI;
        camera.current.position.x = -cy * 4 / 2;
        camera.current.lookAt(0, 0, 0);

        // Animate
        spring.start({
            rotation: ([
                THREE.MathUtils.degToRad(0 + mouse.current.y * 5),
                (flip ? 0 : Math.PI) - (
                    mouse.current.hover 
                        ? THREE.MathUtils.degToRad(mouse.current.x * 5)
                        : Math.sin(-state.clock.getElapsedTime()) * Math.PI * .10
                ),
                0
            ] as unknown) as THREE.Vector3,
            position: ([.025 * Math.sin(t / 2), .125 + .025 * Math.sin(t), mouse.current.hover ? 0.6 : 0.5] as unknown) as THREE.Euler,
            config: {
                mass: 30,
                tension: 300,
                friction: 100
            }
        });

        // Render
        state.gl.setRenderTarget(target.current);
        state.gl.render(scene.current, camera.current);
        state.gl.setRenderTarget(null);
    });

    return (
        <animated.group {...cardProps} ref={mesh}>
            {createPortal(<CardArt textures={layers} />, scene.current)}
            <Card
                materials={<>
                    <meshPhongMaterial
                        attach="material-0"
                        color={stockBase}
                    />
                    <meshPhongMaterial
                        attach="material-1"
                        color={colorBase}
                        emissive={colorEmissive}
                        emissiveIntensity={0.125}
                        specular={colorSpecular}
                        shininess={200}
                        normalMap={normal}
                        // @ts-ignore: r3f shorthand types not included
                        normalScale={[0.03, 0.03]}
                    />
                    <meshBasicMaterial
                        blending={THREE.NormalBlending}
                        attach="material-2"
                        map={target.current.texture}
                    />
                </>}
                children={<>
                    <CardInk
                        side={THREE.FrontSide}
                        alpha={border}
                        color={colorBase}
                        emissive={colorEmissive}
                        specular={colorSpecular}
                        normal={normal}
                    />
                    {mask && <CardInk
                        alpha={mask}
                        side={THREE.FrontSide}
                        color={stockBase}
                        specular={undefined}
                        emissive={undefined}
                        normal={undefined}
                    />}
                    <CardInk
                        side={THREE.BackSide}
                        alpha={back}
                        color={colorBase}
                        emissive={colorEmissive}
                        specular={colorSpecular}
                        normal={normal}
                    />
                </>}
            />
        </animated.group>
    );
};

function Card({
    materials,
    ...props
} : {
    materials?: React.ReactNode;
    children?: React.ReactNode;
}) {
    const geometry = useCardGeometry();
    return <>
        <group>
            <group {...props}>
                <mesh geometry={geometry}>
                    {materials || <meshPhongMaterial color={"#000"} />}
                </mesh>
                {props.children}
            </group>
        </group>
    </>
};


function host (canister : string) {
    return `https://${canister}.raw.ic0.app`;
};

function suspend<T>(promise: Promise<T>) {
    let result: T;
    let status = 'pending';


    const suspender = promise.then(response => {
        status = 'success';
        result = response;
    }, error => {
        status = 'error';
        result = error;
    });

    return function () {
        switch (status) {
            case 'pending':
                throw suspender;
            case 'error':
                throw result;
            default:
                return result;
        }
    };
}

// Get normal map from canister.
function useLegendNormal(canister: string, manifest: LegendManifest): THREE.Texture {
    const { maps: { normal } } = manifest;
    return useLoader(THREE.TextureLoader, `${host(canister)}${normal}`);
};

// Get card back alpha map from canister.
function useLegendBack(canister: string, manifest: LegendManifest): THREE.Texture {
    const { maps: { back } } = manifest;
    return useLoader(THREE.TextureLoader, `${host(canister)}${back}`);
};

// Get card border alpha map from canister.
function useLegendBorder(canister: string, manifest: LegendManifest): THREE.Texture {
    const { maps: { border } } = manifest;
    return useLoader(THREE.TextureLoader, `${host(canister)}${border}`);
};

// Get parallax layer textures from canister.
function useLegendLayers(canister: string, manifest: LegendManifest): THREE.Texture[] {
    const { maps: { layers } } = manifest;
    return layers.map(layer => useLoader(THREE.TextureLoader, `${host(canister)}${layer}`));
};

// Get mask alpha map from canister.
function useLegendMask(canister: string, manifest: LegendManifest): THREE.Texture | undefined {
    const { maps: { mask } } = manifest;
    return mask ? useLoader(THREE.TextureLoader, `${host(canister)}${mask}`) : undefined;
};

// Get colors from canister.
function useLegendColors(canister: string, manifest: LegendManifest): [THREE.Color, THREE.Color, THREE.Color, THREE.Color] {
    const { colors: { base, specular, emissive, background } } = manifest;
    return [
        new THREE.Color(base).convertSRGBToLinear(),
        new THREE.Color(specular).convertSRGBToLinear(),
        new THREE.Color(emissive).convertSRGBToLinear(),
        new THREE.Color(background).convertSRGBToLinear(),
    ];
}

// Get card stock colors from canister.
function useLegendStock(canister: string, manifest: LegendManifest): [THREE.Color, THREE.Color, THREE.Color] {
    const { stock: { base, specular, emissive } } = manifest;
    return [
        new THREE.Color(base).convertSRGBToLinear(),
        new THREE.Color(specular).convertSRGBToLinear(),
        new THREE.Color(emissive).convertSRGBToLinear(),
    ];
}
// Get card face from canister.
function useLegendFlat(canister: string, manifest: LegendManifest): THREE.Texture {
    const { views: { flat } } = manifest;
    return useLoader(THREE.TextureLoader, `${host(canister)}${flat}`);
}
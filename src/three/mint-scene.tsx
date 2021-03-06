import React from 'react';
import * as THREE from 'three';
import { useThree, Canvas, useFrame, useLoader } from '@react-three/fiber'
import { animated, useSpring, useSpringRef } from '@react-spring/three'
import Threads from 'assets/textures/threads.png'
import useStore from 'stores/index';
import { cardMovementSpringConf, cardSpringConf } from './springs';
import { Legend } from './legend';
import { fetchLegendManifest, LegendManifest } from 'api/legends';

const center = new THREE.Vector3(0, 0, 0);
const centerVec = new THREE.Object3D();
centerVec.position.x = 0;
centerVec.position.y = 0;
centerVec.position.z = 0;

function Scene({ canister }: { canister: string }) {
    const { isMinting, mintResult } = useStore();
    const { camera } = useThree();

    React.useEffect(() => {
        camera.position.set(0, 5, 5);
        camera.lookAt(center);
    }, []);

    function lightPos() {
        return mintResult !== undefined
            ? [0, 6.5, 2]
            : [0, 4, 5];
    };

    function lightInt() {
        return mintResult !== undefined
            ? .5
            : .125;
    };

    const lightSpring = useSpring({
        position: lightPos(),
        intensity: lightInt(),
        config: cardSpringConf,
    });

    // Textures

    const [manifest, setManifest] = React.useState<LegendManifest>();

    React.useEffect(() => {
        if (!mintResult) {
            setManifest(undefined);
            return;
        };
        fetchLegendManifest(canister, mintResult)
            .then(setManifest)
            .catch(console.error);
    }, [mintResult]);

    return <>
        <group
            position={[0, 2, 2]}
            rotation={[-Math.PI * .24, 0, 0]}
        >
            {mintResult && manifest && <React.Suspense fallback={<Loader />}><Legend canister={canister} manifest={manifest} /></React.Suspense>}
            <LegendBox open={mintResult !== undefined} minting={isMinting} />
        </group>
        {/* @ts-ignore: r3f shorthand types not included */}
        <animated.directionalLight {...lightSpring} target={centerVec} />
        <group position={[0, 1, 4]}><Light i={mintResult ? 1.5 : 1} /></group>
        {isMinting && <Sprites />}
    </>
};

function LegendBox({ open, minting }: { open: boolean, minting: boolean }) {
    const thickness = .05;

    const rootPos = React.useMemo(() => () => ([open ? 0 : -1.5, open ? -3.5 : 0, open ? -3 : 0] as [number, number, number]), [open]);
    const rootRot = React.useMemo(() => () => ([open ? -Math.PI * .5 : 0, 0, 0] as [number, number, number]), [open]);
    const doorRot = React.useMemo(() => () => ([0, open ? -Math.PI : 0, 0] as [number, number, number]), [open]);

    const spring = useSpringRef();
    const rootSpring = useSpring({
        ref: spring,
        position: rootPos(),
        rotation: rootRot(),
        config: cardSpringConf,
    });

    const doorSpring = useSpring({
        rotation: doorRot(),
        config: cardMovementSpringConf,
    });

    useFrame(state => {
        const pos = rootPos();
        const t = state.clock.getElapsedTime();
        spring.start({
            position: [pos[0] + (minting ? .3 : .1) * Math.cos(t * (minting ? 2 : 1)), pos[1] + .1 * Math.sin(t * (minting ? 2 : 1)), pos[2]],
            rotation: rootRot(),
            config: cardSpringConf,
        })
    })

    const alpha = useLoader(THREE.TextureLoader, Threads);

    {/* @ts-ignore: r3f shorthand types not included */ }
    return <animated.group {...rootSpring}>
        {/* Front half */}
        {/* @ts-ignore: r3f shorthand types not included */}
        <animated.group position={[0, 0, (thickness - .0125) * (open ? -1 : 1)]} {...doorSpring}>
            <mesh position={[1.5, 0, 0]}>
                <boxGeometry args={[3, 5, thickness * 2]} />
                <meshStandardMaterial color={'#333'} />
            </mesh>
            {/* Front rune */}
            <group>
                <mesh position={[1.5, 0, thickness + .01]}>
                    <planeGeometry args={[3 * .375, 5 * .375]} />
                    <meshPhongMaterial
                        transparent={true}
                        alphaMap={alpha}
                        color={'#b79602'}
                        emissive={'#b86e00'}
                        emissiveIntensity={0.125}
                        specular={'#e2b400'}
                        shininess={200}
                    />
                </mesh>
            </group>
        </animated.group>
        {/* Seated half. */}
        <group position={[0, 0, -thickness - .0125]}>
            <mesh position={[1.5, 0, 0]}>
                <boxGeometry args={[3, 5, thickness]} />
                <meshStandardMaterial color={'#333'} />
            </mesh>
            <mesh position={[1.5, -2.4375, thickness]}>
                <boxGeometry args={[3, .125, thickness]} />
                <meshStandardMaterial color={'#333'} />
            </mesh>
            <mesh position={[1.5, 2.4375, thickness]}>
                <boxGeometry args={[3, .125, thickness]} />
                <meshStandardMaterial color={'#333'} />
            </mesh>
            <mesh position={[2.9325, 0, thickness]}>
                <boxGeometry args={[.125, 5, thickness]} />
                <meshStandardMaterial color={'#333'} />
            </mesh>
            <mesh position={[.0625, 0, thickness]}>
                <boxGeometry args={[.125, 5, thickness]} />
                <meshStandardMaterial color={'#333'} />
            </mesh>
            {/* Felt interior */}
            <mesh position={[1.5 - thickness, 0, 0.01]}>
                <boxGeometry args={[3 - thickness * 2, 5 - thickness * 2, thickness]} />
                <meshStandardMaterial color={'rgb(255, 196, 0)'} />
            </mesh>
            <mesh position={[1.5, -2.4375 + .01 + .0625, thickness + .01]}>
                <boxGeometry args={[3 - .25, .0625, thickness]} />
                <meshStandardMaterial color={'rgb(255, 196, 0)'} />
            </mesh>
            <mesh position={[1.5, 2.4375 - .01 - .0625, thickness + .01]}>
                <boxGeometry args={[3 - .25, .0625, thickness]} />
                <meshStandardMaterial color={'rgb(255, 196, 0)'} />
            </mesh>
            <mesh position={[2.9325 - .03125, 0, thickness + .01]}>
                <boxGeometry args={[.0625, 5 - .21, thickness]} />
                <meshStandardMaterial color={'rgb(255, 196, 0)'} />
            </mesh>
            <mesh position={[.0625 + .03125, 0, thickness + .01]}>
                <boxGeometry args={[.0625, 5 - .21, thickness]} />
                <meshStandardMaterial color={'rgb(255, 196, 0)'} />
            </mesh>
        </group>
        {/* Hinge 1 */}
        <group position={[0, -2, 0]}>
            <mesh>
                <cylinderGeometry args={[.05, .05, .5]} />
                <meshStandardMaterial metalness={4} roughness={3} color={'grey'} />
            </mesh>
        </group>
        {/* Hinge 2 */}
        <group position={[0, 2, 0]}>
            <mesh>
                <cylinderGeometry args={[.05, .05, .5]} />
                <meshStandardMaterial metalness={5} roughness={3} color={'grey'} />
            </mesh>
        </group>
    </animated.group>
};

function Sprites() {
    // Light ref
    const light = React.useRef<THREE.DirectionalLight>(null);

    // Particles
    const { count, roam, color, speed } = {
        count: 50,
        roam: 8,
        speed: .1,
        color: '#ffeb36',
    };
    const mesh = React.useRef<THREE.InstancedMesh>(null);
    const group = React.useRef<THREE.Group>(null);
    const dummy = React.useMemo(() => new THREE.Object3D(), []);
    const particles = React.useMemo(() => {
        const particles = [];
        const posEquations: ((position: number[], time: number, factor: number, speed: number) => number[])[] = [
            (p, t, f, s) => [
                p[0] + Math.sin(t * s) * f,
                p[1] + Math.cos(t * s) * f,
                p[2] + Math.sin(t * s) * f,
            ],
            (p, t, f, s) => [
                p[0] + 2 * Math.sin(t * s) * f,
                p[1] + 2 * Math.cos(t * s) * Math.sin(t * s) * f,
                p[2] + Math.sin(2 * t * s) * f,
            ],
            (p, t, f, s) => [
                p[0] + p[0] * Math.sin(t * s) * f,
                p[1] + p[1] * Math.cos(t * s) * f,
                p[2] + Math.sin(2 * t * s) * f,
            ],
        ];
        for (let i = 0; i < count; i++) {
            const factor = Math.random() * .5;
            const s = Math.floor(Math.random() * 10);
            const flicker = Math.ceil(Math.random());
            const position = [
                -roam / 2 + Math.random() * roam,
                -roam / 2 + Math.random() * roam,
                -roam / 2 + Math.random() * roam,
            ];
            const rotation = [
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
            ] as [number, number, number];
            const equation = posEquations[Math.floor(Math.random() * posEquations.length)];
            particles.push({ factor, speed: s, position, rotation, equation, flicker });
        };
        return particles;
    }, [count, roam, speed]);

    // Animation
    useFrame(state => {
        if (!light.current || !mesh.current) return;
        const time = state.clock.getElapsedTime();
        const phase = Math.PI / 2 - (time) * Math.PI * 2;

        // Light
        const flicker = Math.random() * .0001;
        light.current.intensity = .1 - Math.sin(phase * 8) * .015 + flicker + .2;

        // Fireflies
        particles.forEach((particle, i) => {
            if (!mesh.current) return;
            const s = Math.cos(phase * particle.flicker * 5 * speed) * .25 + .3;
            const [x, y, z] = particle.equation(particle.position, phase, particle.factor, particle.speed * speed)
            dummy.position.set(x, y, z);
            dummy.rotation.set(...particle.rotation)
            dummy.scale.set(s, s, s);
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return <>
        <directionalLight ref={light} position={[0, 1, 4.5]} intensity={0} />

        <group ref={group}>
            <instancedMesh ref={mesh} args={[, , count]}>
                <dodecahedronGeometry args={[.1, 0]} />
                <meshPhongMaterial color={color} emissive={color} />
            </instancedMesh>
        </group>
    </>
};

export default function MintScene({ canister }: { canister: string }) {
    return <>
        <Canvas>
            <React.Suspense fallback={<></>}>
                <Scene canister={canister} />
                {/* <camera position={[0, 5, 5]} /> */}
            </React.Suspense>
        </Canvas>
    </>
};

export function Loader() {
    const mesh = React.useRef<THREE.Mesh>(null);

    useFrame(state => {
        if (!mesh.current) return;
        const t = state.clock.getElapsedTime();
        const s = 3;
        const f = .25;
        mesh.current.position.x = 2 * Math.sin(t * s) * f;
        mesh.current.position.y = 2 * Math.cos(t * s) * Math.sin(t * s) * f;
    });

    return <mesh ref={mesh}>
        <sphereGeometry args={[.125, 10, 10]} />
        <meshStandardMaterial color="white" />
    </mesh>
}

function Light({ i }: { i: number }) {
    return <>
        <directionalLight
            intensity={.5 * i}
            position={[0, 0.5, 2]}
            target={centerVec}
        />
        <directionalLight
            intensity={.25 * i}
            position={[20, -1, 3]}
            target={centerVec}
        />
        <directionalLight
            intensity={.25 * i}
            position={[-20, -1, 3]}
            target={centerVec}
        />
        <directionalLight
            intensity={.125 * i}
            position={[4, 8, 2]}
            target={centerVec}
        />
        <directionalLight
            intensity={.125 * i}
            position={[-4, 8, 2]}
            target={centerVec}
        />
        <directionalLight
            intensity={.25 * i}
            position={[3, 0, 2]}
            target={centerVec}
        />
        <directionalLight
            intensity={.25 * i}
            position={[-3, 0, 2]}
            target={centerVec}
        />
    </>
}
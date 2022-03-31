import React from 'react';
import * as THREE from 'three';
import { useThree, Canvas, useFrame, PerspectiveCameraProps, Camera, ThreeEvent } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei/core'
import { animated, useSpring, useSpringRef } from '@react-spring/three'

const center = new THREE.Vector3(0, 0, 0);

function Scene () {
    const { camera } = useThree();
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        camera.position.set(0, 5, 5);
        camera.lookAt(center);
    }, []);

    return <>
        <group onClick={e => setOpen(!open)} position={[0, 2, 2]} rotation={[-Math.PI * .24, 0, 0]}><LegendBox open={open} /></group>
        {/* <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[25, 10]} />
            <meshStandardMaterial color={'#444'} />
        </mesh> */}
        {/* <ambientLight intensity={1} /> */}
        <directionalLight intensity={.5} />
        <hemisphereLight args={['#202059', '#1C367C']} intensity={.5} />
        {/* <OrbitControls /> */}
    </>
};

function LegendBox ({ open } : { open : boolean}) {
    const thickness = .05;

    const rootPos = React.useMemo(() => () => ([open ? 0 : -1.5, 0, 0] as [number, number, number]), [open]);
    const doorRot = React.useMemo(() => () => ([0, open ? -Math.PI : 0, 0] as [number, number, number]), [open]);

    const spring = useSpringRef();
    const rootSpring = useSpring({
        ref: spring,
        position: rootPos(),
    });

    const doorSpring = useSpring({
        rotation: doorRot(),
    });

    useFrame(state => {
        const pos = rootPos();
        const t = state.clock.getElapsedTime();
        spring.start({
            position: [pos[0] + .1 * Math.cos(t), pos[1] + .1 * Math.sin(t), pos[2]]
        })
    })

    return <animated.group {...rootSpring}>
        {/* Front half */}
        {/* @ts-ignore */}
        <animated.group position={[0, 0, (thickness - .0125) * (open ? -1 : 1)]} {...doorSpring}>
            <mesh position={[1.5, 0, 0]}>
                <boxGeometry args={[3, 5, thickness * 2]} />
                <meshStandardMaterial color={'#333'} />
            </mesh>
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

export default function MintScene () {
    return <>
        <Canvas>
            <Scene />
            {/* <camera position={[0, 5, 5]} /> */}
        </Canvas>
    </>
};
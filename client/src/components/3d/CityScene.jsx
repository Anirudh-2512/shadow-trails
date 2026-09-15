import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { isWebGLAvailable } from '../../lib/webgl.js';

function City({ count = 40 }) {
  const group = useRef();
  const buildings = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 60;
      const z = (Math.random() - 0.5) * 60;
      if (Math.abs(x) < 4 && Math.abs(z) < 4) continue;
      const w = 1 + Math.random() * 3;
      const d = 1 + Math.random() * 3;
      const h = 2 + Math.random() * 10;
      const color = ['#a855f7', '#22d3ee', '#fb923c'][Math.floor(Math.random() * 3)];
      arr.push({ x, z, w, d, h, color });
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = clock.elapsedTime * 0.03;
  });

  return (
    <group ref={group}>
      <gridHelper args={[80, 40, '#7e22ce', '#1a1a24']} position={[0, 0.01, 0]} />
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshBasicMaterial color={b.color} wireframe transparent opacity={0.6} />
        </mesh>
      ))}
      <Stars radius={100} depth={50} count={800} factor={4} fade speed={1} />
    </group>
  );
}

function Rain({ count = 180 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = Math.random() * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= delta * (6 + Math.random() * 2);
      if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = 25;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#22d3ee" size={0.08} transparent opacity={0.5} />
    </points>
  );
}

function TrailOrbs() {
  const orbs = useMemo(
    () =>
      Array.from({ length: 8 }, () => ({
        x: (Math.random() - 0.5) * 40,
        y: 2 + Math.random() * 6,
        z: (Math.random() - 0.5) * 40,
        speed: 0.5 + Math.random(),
        phase: Math.random() * Math.PI * 2,
      })),
    []
  );
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ref.current) {
      ref.current.children.forEach((c, i) => {
        c.position.y = orbs[i].y + Math.sin(t * orbs[i].speed + orbs[i].phase) * 0.8;
      });
    }
  });
  return (
    <group ref={ref}>
      {orbs.map((o, i) => (
        <mesh key={i} position={[o.x, o.y, o.z]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color={i % 3 === 0 ? '#a855f7' : i % 3 === 1 ? '#22d3ee' : '#fb923c'} emissive="#ffffff" emissiveIntensity={0.35} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function CameraDrift() {
  useFrame(({ clock, camera }) => {
    camera.position.set(Math.sin(clock.elapsedTime * 0.05) * 6, 8 + Math.sin(clock.elapsedTime * 0.03) * 2, 22);
    camera.lookAt(0, 3, 0);
  });
  return null;
}

export default function CityScene() {
  if (!isWebGLAvailable()) return <FallbackCity />;
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 8, 22], fov: 50 }}
        gl={{ antialias: false, powerPreference: 'low-power' }}
        dpr={[1, 1.25]}
      >
        <color attach="background" args={['#050507']} />
        <fog attach="fog" args={['#050507', 25, 70]} />
        <ambientLight intensity={0.25} />
        <pointLight position={[0, 12, 5]} intensity={30} color="#a855f7" distance={60} />
        <CityDriftCombined />
      </Canvas>
    </div>
  );
}

function CityDriftCombined() {
  return (
    <>
      <City />
      <Rain />
      <TrailOrbs />
      <CameraDrift />
    </>
  );
}

function FallbackCity() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,#1b0b2e_0%,#050507_70%)]" />
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(168,85,247,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.15) 1px, transparent 1px)',
          backgroundSize: '60px 40px, 60px 100%',
        }}
      />
      <div className="absolute bottom-0 flex h-1/2 w-full items-end justify-center gap-2 px-8">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="w-8 border border-neon-purple/30 bg-black/60"
            style={{
              height: `${20 + ((i * 37) % 60)}%`,
              boxShadow: 'inset 0 0 12px rgba(168,85,247,0.15)',
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.9))]" />
    </div>
  );
}

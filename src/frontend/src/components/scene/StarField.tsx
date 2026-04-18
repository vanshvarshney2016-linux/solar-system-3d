import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const STAR_COUNT = 6000;
const FIELD_RADIUS = 900;

export function StarField() {
  const ref = useRef<THREE.Points>(null);

  const { positions, sizes, colors } = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3);
    const siz = new Float32Array(STAR_COUNT);
    const col = new Float32Array(STAR_COUNT * 3);

    const starColors = [
      new THREE.Color("#ffffff"),
      new THREE.Color("#fffaef"),
      new THREE.Color("#e8f0ff"),
      new THREE.Color("#ffd0a0"),
      new THREE.Color("#c8d8ff"),
    ];

    for (let i = 0; i < STAR_COUNT; i++) {
      // Fibonacci sphere distribution for uniform density
      const theta = Math.acos(1 - (2 * (i + 0.5)) / STAR_COUNT);
      const phi = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = FIELD_RADIUS * (0.7 + Math.random() * 0.3);

      pos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
      pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      pos[i * 3 + 2] = r * Math.cos(theta);

      siz[i] = Math.random() < 0.05 ? 2.5 : 0.6 + Math.random() * 1.2;

      const c = starColors[Math.floor(Math.random() * starColors.length)];
      const brightness = 0.5 + Math.random() * 0.5;
      col[i * 3] = c.r * brightness;
      col[i * 3 + 1] = c.g * brightness;
      col[i * 3 + 2] = c.b * brightness;
    }
    return { positions: pos, sizes: siz, colors: col };
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.00008;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

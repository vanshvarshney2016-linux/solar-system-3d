import { useMemo } from "react";
import * as THREE from "three";

interface OrbitPathProps {
  radius: number;
  eccentricity?: number;
  inclination?: number;
  color?: string;
  opacity?: number;
  segments?: number;
}

export function OrbitPath({
  radius,
  eccentricity = 0,
  inclination = 0,
  color = "#ffffff",
  opacity = 0.15,
  segments = 128,
}: OrbitPathProps) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const a = radius;
    const b = a * Math.sqrt(1 - eccentricity * eccentricity);
    const c = a * eccentricity; // focus offset

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = a * Math.cos(angle) - c;
      const z = b * Math.sin(angle);
      pts.push(new THREE.Vector3(x, 0, z));
    }
    return pts;
  }, [radius, eccentricity, segments]);

  const inclinationRad = (inclination * Math.PI) / 180;

  return (
    <group rotation={[inclinationRad, 0, 0]}>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </line>
    </group>
  );
}

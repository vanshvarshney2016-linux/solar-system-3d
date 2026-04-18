import { BodyLabel } from "@/components/scene/BodyLabel";
import { SaturnRings } from "@/components/scene/SaturnRings";
import type { CelestialBody as CelestialBodyType } from "@/types/solar-system";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useCallback, useMemo, useRef } from "react";
import * as THREE from "three";

interface CelestialBodyProps {
  body: CelestialBodyType;
  position: [number, number, number];
  showLabel: boolean;
  selected: boolean;
  onClick: (id: string) => void;
  /** rotationPeriod in hours (signed; negative = retrograde) */
  rotationPeriod?: number;
}

function buildPlanetMaterial(
  body: CelestialBodyType,
): THREE.MeshStandardMaterial {
  const isStar = body.type === "star";
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(body.color),
    roughness: isStar ? 1 : 0.72,
    metalness: isStar ? 0 : 0.06,
    emissive: isStar
      ? new THREE.Color(body.glowColor ?? body.color)
      : body.glowColor
        ? new THREE.Color(body.glowColor)
        : new THREE.Color(0, 0, 0),
    emissiveIntensity: isStar ? 1 : body.glowColor ? 0.12 : 0,
  });
  return mat;
}

const LABEL_Y_OFFSET = 1.4; // scene-units above the sphere top

export function CelestialBodyMesh({
  body,
  position,
  showLabel,
  selected,
  onClick,
  rotationPeriod = 24,
}: CelestialBodyProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const material = useMemo(() => buildPlanetMaterial(body), [body]);

  // Glow material for atmospheres / stars
  const glowMaterial = useMemo(() => {
    const color = body.glowColor ?? (body.type === "star" ? "#FFD700" : null);
    if (!color) return null;
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: body.type === "star" ? 0.22 : 0.08,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [body]);

  const rotSpeed = useMemo(() => {
    if (!rotationPeriod || rotationPeriod === 0) return 0;
    // Convert hours to radians/second (at timeScale=1 → 1s = 1 Earth day = 24h)
    return (Math.PI * 2) / (rotationPeriod / 24);
  }, [rotationPeriod]);

  const tiltRad = (body.axialTilt * Math.PI) / 180;
  const glowScale = body.type === "star" ? 1.18 : 1.22;

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotSpeed * delta;
    }
    // Subtle pulsing for the star glow
    if (glowRef.current && body.type === "star") {
      const t = performance.now() * 0.001;
      const pulse = 1.16 + Math.sin(t * 0.7) * 0.04;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onClick(body.id);
    },
    [body.id, onClick],
  );

  const r = body.displayRadius;
  const labelOffset: [number, number, number] = [0, r + LABEL_Y_OFFSET, 0];

  return (
    <group position={position}>
      {/* Axial tilt group */}
      <group rotation={[0, 0, tiltRad]}>
        {/* Glow shell */}
        {glowMaterial && (
          <mesh ref={glowRef} scale={glowScale}>
            <sphereGeometry args={[r, 32, 32]} />
            <primitive object={glowMaterial} attach="material" />
          </mesh>
        )}

        {/* Selection ring */}
        {selected && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r * 1.35, r * 1.45, 64]} />
            <meshBasicMaterial
              color="#00d4ff"
              transparent
              opacity={0.55}
              side={THREE.DoubleSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}

        {/* Main sphere — R3F mesh; keyboard nav handled by HTML body-list overlay */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: R3F mesh element, not a DOM interactive element */}
        <mesh ref={meshRef} onClick={handleClick}>
          <sphereGeometry args={[r, 48, 48]} />
          <primitive object={material} attach="material" />
        </mesh>

        {/* Saturn rings (rendered inside tilt group so rings tilt with planet) */}
        {body.hasRings && body.id === "saturn" && (
          <SaturnRings innerRadius={r * 1.35} outerRadius={r * 2.4} />
        )}

        {/* Uranus thin rings */}
        {body.hasRings && body.id === "uranus" && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r * 1.5, r * 1.9, 64]} />
            <meshBasicMaterial
              color="#88CCCC"
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>

      {/* Label (outside tilt so it stays upright) */}
      {showLabel && (
        <BodyLabel body={body} offset={labelOffset} selected={selected} />
      )}
    </group>
  );
}

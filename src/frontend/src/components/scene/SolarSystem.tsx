import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { CelestialBodyMesh } from "@/components/scene/CelestialBody";
import { OrbitPath } from "@/components/scene/OrbitPath";
import { StarField } from "@/components/scene/StarField";
import {
  MOONS,
  PLANETS,
  SUN,
  getMoonsForPlanet,
} from "@/data/solar-system-data";
import { orbitalPosition, phaseFromId } from "@/hooks/use-solar-system";
import type { SolarSystemStore } from "@/types/solar-system";
import type { MoonData, PlanetData } from "@/types/solar-system";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrbitControlsImpl = any;

// ---------------------------------------------------------------------------
// Camera focus helper — lerp camera toward a target over time
// ---------------------------------------------------------------------------
const FOCUS_SPEED = 2.8;

function useCameraFocus(selectedBodyId: string | null) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const targetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const focusingRef = useRef(false);
  const destCamRef = useRef<THREE.Vector3 | null>(null);

  // When selection changes, compute destination
  useEffect(() => {
    // We defer the actual world position lookup to the frame loop
    // by setting focusingRef — world positions are recalculated each frame.
    focusingRef.current = selectedBodyId !== null;
    if (selectedBodyId === null) {
      // Float back to default overview
      destCamRef.current = new THREE.Vector3(0, 40, 80);
      targetRef.current.set(0, 0, 0);
    }
  }, [selectedBodyId]);

  return { controlsRef, targetRef, focusingRef, destCamRef };
}

// ---------------------------------------------------------------------------
// Planet component (manages moon orbits too)
// ---------------------------------------------------------------------------
function PlanetWithMoons({
  planet,
  elapsed,
  sim,
  onWorldPos,
}: {
  planet: PlanetData;
  elapsed: number;
  sim: SolarSystemStore;
  onWorldPos: (id: string, pos: [number, number, number]) => void;
}) {
  const phase = useMemo(() => phaseFromId(planet.id), [planet.id]);
  const [px, pz] = orbitalPosition(
    planet.orbitRadius,
    planet.orbital.period,
    elapsed,
    planet.orbital.eccentricity,
    phase,
  );
  const planetPos: [number, number, number] = [px, 0, pz];

  // Report world pos so camera focus can use it
  useEffect(() => {
    onWorldPos(planet.id, planetPos);
  });

  const moons = useMemo(() => getMoonsForPlanet(planet.id), [planet.id]);

  return (
    <>
      <CelestialBodyMesh
        body={planet}
        position={planetPos}
        showLabel={sim.showLabels}
        selected={sim.selectedBodyId === planet.id}
        onClick={sim.selectBody}
        rotationPeriod={planet.rotationPeriod}
      />

      {moons.map((moon) => (
        <MoonBody
          key={moon.id}
          moon={moon}
          parentPos={planetPos}
          elapsed={elapsed}
          sim={sim}
          onWorldPos={onWorldPos}
        />
      ))}
    </>
  );
}

function MoonBody({
  moon,
  parentPos,
  elapsed,
  sim,
  onWorldPos,
}: {
  moon: MoonData;
  parentPos: [number, number, number];
  elapsed: number;
  sim: SolarSystemStore;
  onWorldPos: (id: string, pos: [number, number, number]) => void;
}) {
  const phase = useMemo(() => phaseFromId(moon.id), [moon.id]);
  const [mx, mz] = orbitalPosition(
    moon.moonOrbitRadius,
    moon.orbital.period,
    elapsed,
    moon.orbital.eccentricity,
    phase,
  );
  const moonPos: [number, number, number] = [
    parentPos[0] + mx,
    parentPos[1],
    parentPos[2] + mz,
  ];

  useEffect(() => {
    onWorldPos(moon.id, moonPos);
  });

  return (
    <>
      {sim.showOrbits && (
        <group position={parentPos}>
          <OrbitPath
            radius={moon.moonOrbitRadius}
            eccentricity={moon.orbital.eccentricity}
            inclination={moon.orbital.inclination}
            color="#8888ff"
            opacity={0.1}
            segments={64}
          />
        </group>
      )}
      <CelestialBodyMesh
        body={moon}
        position={moonPos}
        showLabel={sim.showLabels}
        selected={sim.selectedBodyId === moon.id}
        onClick={sim.selectBody}
        rotationPeriod={24}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Main scene
// ---------------------------------------------------------------------------
export function SolarSystem({
  sim,
}: {
  sim: SolarSystemStore & {
    elapsedRef: React.MutableRefObject<number>;
    tick: (d: number) => void;
  };
}) {
  const { camera } = useThree();
  const { controlsRef, targetRef, focusingRef, destCamRef } = useCameraFocus(
    sim.selectedBodyId,
  );

  // Live world positions — updated each frame
  const worldPosMap = useRef<Map<string, [number, number, number]>>(new Map());

  const handleWorldPos = useCallback(
    (id: string, pos: [number, number, number]) => {
      worldPosMap.current.set(id, pos);
    },
    [],
  );

  // Snapshot elapsed for this render so all children use the same time
  const [displayElapsed, setDisplayElapsed] = useState(0);

  useFrame((_, delta) => {
    sim.tick(delta);
    setDisplayElapsed(sim.elapsedRef.current);

    // Camera focus logic
    if (sim.selectedBodyId && focusingRef.current) {
      const wp = worldPosMap.current.get(sim.selectedBodyId);
      if (wp) {
        // Choose approach distance based on body size
        let body =
          sim.selectedBodyId === "sun"
            ? SUN
            : (PLANETS.find((p) => p.id === sim.selectedBodyId) ??
              MOONS.find((m) => m.id === sim.selectedBodyId));
        const r = body?.displayRadius ?? 1;
        const dist = Math.max(r * 5, 4);

        const target = new THREE.Vector3(...wp);
        targetRef.current.lerp(target, delta * FOCUS_SPEED);

        const dir = camera.position.clone().sub(targetRef.current).normalize();
        const destCam = targetRef.current.clone().add(dir.multiplyScalar(dist));
        destCamRef.current = destCam;

        camera.position.lerp(destCam, delta * FOCUS_SPEED * 0.7);
        if (controlsRef.current) {
          controlsRef.current.target.copy(targetRef.current);
          controlsRef.current.update();
        }
      }
    } else if (!sim.selectedBodyId && destCamRef.current) {
      camera.position.lerp(destCamRef.current, delta * 1.5);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(
          new THREE.Vector3(0, 0, 0),
          delta * 1.5,
        );
        controlsRef.current.update();
      }
      if (camera.position.distanceTo(destCamRef.current) < 0.5) {
        destCamRef.current = null;
      }
    }
  });

  return (
    <>
      {/* Ambient + point lights */}
      <ambientLight intensity={0.04} />
      <pointLight
        position={[0, 0, 0]}
        intensity={3200}
        color="#FFF8E7"
        decay={2}
        castShadow={false}
      />

      {/* OrbitControls */}
      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        zoomSpeed={1.2}
        rotateSpeed={0.55}
        panSpeed={0.8}
        minDistance={1.5}
        maxDistance={800}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
      />

      {/* Stars */}
      <StarField />

      {/* Sun */}
      <CelestialBodyMesh
        body={SUN}
        position={[0, 0, 0]}
        showLabel={sim.showLabels}
        selected={sim.selectedBodyId === "sun"}
        onClick={sim.selectBody}
        rotationPeriod={609.12}
      />

      {/* Sunlight lens flare effect (simple additive sphere) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[SUN.displayRadius * 1.06, 32, 32]} />
        <meshBasicMaterial
          color="#FFD040"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Planet orbits */}
      {sim.showOrbits &&
        PLANETS.map((planet) => (
          <OrbitPath
            key={`orbit-${planet.id}`}
            radius={planet.orbitRadius}
            eccentricity={planet.orbital.eccentricity}
            inclination={planet.orbital.inclination}
            color="#4488ff"
            opacity={0.13}
          />
        ))}

      {/* Planets + moons */}
      {PLANETS.map((planet) => (
        <PlanetWithMoons
          key={planet.id}
          planet={planet}
          elapsed={displayElapsed}
          sim={sim}
          onWorldPos={handleWorldPos}
        />
      ))}
    </>
  );
}

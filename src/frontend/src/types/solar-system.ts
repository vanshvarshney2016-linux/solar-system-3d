export type BodyType = "star" | "planet" | "moon" | "dwarf-planet";

export interface OrbitalParams {
  /** Semi-major axis in AU (for planets) or 1000 km (for moons) */
  semiMajorAxis: number;
  /** Orbital period in Earth days */
  period: number;
  /** Eccentricity 0..1 */
  eccentricity: number;
  /** Inclination in degrees */
  inclination: number;
}

export interface CelestialBody {
  id: string;
  name: string;
  type: BodyType;
  /** Equatorial radius relative to Earth (Earth = 1) */
  radiusEarth: number;
  /** Display radius for 3D scene (scene units) */
  displayRadius: number;
  /** Primary body color (hex) */
  color: string;
  /** Secondary / ring color (hex), optional */
  colorSecondary?: string;
  /** Axial tilt in degrees */
  axialTilt: number;
  /** Atmosphere / glow color (hex), optional */
  glowColor?: string;
  orbital: OrbitalParams;
  /** IDs of moons orbiting this body */
  moonIds?: string[];
  /** ID of parent body (for moons) */
  parentId?: string;
  /** Whether body has rings */
  hasRings?: boolean;
  /** Fun fact shown in info panel */
  fact: string;
}

export interface PlanetData extends CelestialBody {
  type: "planet";
  /** Display orbital radius in scene units */
  orbitRadius: number;
  /** Sidereal rotation period in hours */
  rotationPeriod: number;
  /** Mean distance from Sun in AU */
  distanceAU: number;
}

export interface MoonData extends CelestialBody {
  type: "moon";
  parentId: string;
  /** Orbit radius around parent in scene units */
  moonOrbitRadius: number;
}

export type SunData = CelestialBody & { type: "star" };

export interface SolarSystemState {
  paused: boolean;
  timeScale: number;
  showLabels: boolean;
  showOrbits: boolean;
  selectedBodyId: string | null;
}

export interface SolarSystemActions {
  togglePause: () => void;
  setTimeScale: (scale: number) => void;
  toggleLabels: () => void;
  toggleOrbits: () => void;
  selectBody: (id: string | null) => void;
  reset: () => void;
}

export type SolarSystemStore = SolarSystemState & SolarSystemActions;

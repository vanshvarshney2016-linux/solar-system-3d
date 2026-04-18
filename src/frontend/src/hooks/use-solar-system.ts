import type {
  SolarSystemActions,
  SolarSystemState,
  SolarSystemStore,
} from "@/types/solar-system";
import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_STATE: SolarSystemState = {
  paused: false,
  timeScale: 1,
  showLabels: true,
  showOrbits: true,
  selectedBodyId: null,
};

/**
 * Central state for the solar-system simulation.
 * Provides animation controls, body selection, and a stable elapsed-time ref
 * that the 3D scene can read without triggering re-renders.
 */
export function useSolarSystem(): SolarSystemStore & {
  /** Mutable ref tracking total elapsed sim-time in seconds — read in useFrame */
  elapsedRef: React.MutableRefObject<number>;
  /** Call every animation frame with real delta-time (seconds) */
  tick: (delta: number) => void;
} {
  const [state, setState] = useState<SolarSystemState>(DEFAULT_STATE);
  const elapsedRef = useRef<number>(0);

  // Advance simulation time
  const tick = useCallback(
    (delta: number) => {
      if (!state.paused) {
        elapsedRef.current += delta * state.timeScale;
      }
    },
    [state.paused, state.timeScale],
  );

  const togglePause = useCallback(() => {
    setState((s) => ({ ...s, paused: !s.paused }));
  }, []);

  const setTimeScale = useCallback((scale: number) => {
    setState((s) => ({ ...s, timeScale: Math.max(0.1, Math.min(100, scale)) }));
  }, []);

  const toggleLabels = useCallback(() => {
    setState((s) => ({ ...s, showLabels: !s.showLabels }));
  }, []);

  const toggleOrbits = useCallback(() => {
    setState((s) => ({ ...s, showOrbits: !s.showOrbits }));
  }, []);

  const selectBody = useCallback((id: string | null) => {
    setState((s) => ({ ...s, selectedBodyId: id }));
  }, []);

  const reset = useCallback(() => {
    elapsedRef.current = 0;
    setState(DEFAULT_STATE);
  }, []);

  return {
    ...state,
    togglePause,
    setTimeScale,
    toggleLabels,
    toggleOrbits,
    selectBody,
    reset,
    elapsedRef,
    tick,
  };
}

// ---------------------------------------------------------------------------
// Orbital position helpers
// ---------------------------------------------------------------------------

const TWO_PI = Math.PI * 2;

/**
 * Compute the (x, z) position of a body on its orbit given elapsed time.
 * @param orbitRadius  scene-unit orbit radius
 * @param period       orbital period in days
 * @param elapsed      elapsed simulation time in seconds (1 s = 1 Earth day at timeScale 1)
 * @param eccentricity orbital eccentricity (0..1)
 * @param phaseOffset  initial phase offset in radians
 */
export function orbitalPosition(
  orbitRadius: number,
  period: number,
  elapsed: number,
  eccentricity = 0,
  phaseOffset = 0,
): [number, number] {
  if (period === 0) return [0, 0];
  const angle = ((elapsed / period) * TWO_PI + phaseOffset) % TWO_PI;
  // Simple elliptical approximation: r = a(1-e²)/(1+e·cos θ)
  const r =
    (orbitRadius * (1 - eccentricity * eccentricity)) /
    (1 + eccentricity * Math.cos(angle));
  return [r * Math.cos(angle), r * Math.sin(angle)];
}

/**
 * Derive a deterministic phase offset from a body ID so orbits start
 * spread around the Sun rather than all aligned at 0°.
 */
export function phaseFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return ((hash >>> 0) / 0xffffffff) * Math.PI * 2;
}

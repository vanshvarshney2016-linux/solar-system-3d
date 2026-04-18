import { SolarSystem } from "@/components/scene/SolarSystem";
import { Button } from "@/components/ui/button";
import { MOONS, PLANETS, SUN } from "@/data/solar-system-data";
import { useSolarSystem } from "@/hooks/use-solar-system";
import type { MoonData, PlanetData } from "@/types/solar-system";
import { Canvas } from "@react-three/fiber";
import {
  ChevronDown,
  ChevronUp,
  Circle,
  Eye,
  EyeOff,
  GitBranch,
  Info,
  Pause,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import { Suspense } from "react";
import { useState } from "react";

type AnyBody = typeof SUN | PlanetData | MoonData;

function getBodyById(id: string): AnyBody | undefined {
  if (id === "sun") return SUN;
  const planet = PLANETS.find((p) => p.id === id);
  if (planet) return planet;
  return MOONS.find((m) => m.id === id);
}

function InfoPanel({
  bodyId,
  onClose,
}: {
  bodyId: string;
  onClose: () => void;
}) {
  const body = getBodyById(bodyId);
  if (!body) return null;

  const isPlanet = body.type === "planet";
  const isMoon = body.type === "moon";
  const planet = isPlanet ? (body as PlanetData) : null;
  const moon = isMoon ? (body as MoonData) : null;

  return (
    <div
      data-ocid="info.panel"
      className="glassmorphism rounded-xl p-4 w-64 fade-in"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-foreground font-display font-semibold text-lg leading-tight">
            {body.name}
          </h2>
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            {body.type}
          </span>
        </div>
        <button
          type="button"
          data-ocid="info.close_button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
          aria-label="Close info panel"
        >
          <X size={14} />
        </button>
      </div>
      <div
        className="w-8 h-8 rounded-full mb-3 ring-2 ring-white/10"
        style={{ background: body.color }}
      />
      <div className="space-y-1 text-xs font-mono text-muted-foreground mb-3">
        {planet && (
          <>
            <div className="flex justify-between">
              <span>Distance</span>
              <span className="text-foreground">{planet.distanceAU} AU</span>
            </div>
            <div className="flex justify-between">
              <span>Orbit period</span>
              <span className="text-foreground">
                {planet.orbital.period.toFixed(0)}d
              </span>
            </div>
            <div className="flex justify-between">
              <span>Axial tilt</span>
              <span className="text-foreground">{body.axialTilt}°</span>
            </div>
          </>
        )}
        {moon && (
          <>
            <div className="flex justify-between">
              <span>Parent</span>
              <span className="text-foreground capitalize">
                {moon.parentId}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Orbit period</span>
              <span className="text-foreground">
                {Math.abs(moon.orbital.period).toFixed(2)}d
              </span>
            </div>
          </>
        )}
        {body.type === "star" && (
          <div className="flex justify-between">
            <span>Radius</span>
            <span className="text-foreground">{body.radiusEarth}× Earth</span>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
        {body.fact}
      </p>
    </div>
  );
}

function SpeedControl({
  timeScale,
  setTimeScale,
}: {
  timeScale: number;
  setTimeScale: (v: number) => void;
}) {
  const steps = [0.1, 0.5, 1, 2, 5, 10, 25, 50, 100];
  const idx = steps.findIndex((s) => s === timeScale);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        data-ocid="controls.speed_down"
        onClick={() =>
          setTimeScale(steps[Math.max(0, (idx === -1 ? 2 : idx) - 1)])
        }
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Decrease speed"
      >
        <ChevronDown size={14} />
      </button>
      <span className="font-mono text-xs w-14 text-center text-foreground">
        {timeScale}×
      </span>
      <button
        type="button"
        data-ocid="controls.speed_up"
        onClick={() =>
          setTimeScale(
            steps[Math.min(steps.length - 1, (idx === -1 ? 2 : idx) + 1)],
          )
        }
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Increase speed"
      >
        <ChevronUp size={14} />
      </button>
    </div>
  );
}

export default function SolarSystemScene() {
  const sim = useSolarSystem();
  const [showBodyList, setShowBodyList] = useState(false);

  const allPlanets = PLANETS;
  const moonsForSelected =
    sim.selectedBodyId && sim.selectedBodyId !== "sun"
      ? MOONS.filter((m) => m.parentId === sim.selectedBodyId)
      : [];

  return (
    <div className="fixed inset-0" data-ocid="solar_system.page">
      {/* 3D Canvas — full viewport */}
      <Canvas
        camera={{ position: [0, 40, 80], fov: 55, near: 0.01, far: 2000 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: "#00000a" }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <SolarSystem sim={sim} />
        </Suspense>
      </Canvas>

      {/* ── Controls overlay (bottom-left) ─────────────────────────────── */}
      <div
        data-ocid="controls.panel"
        className="absolute bottom-6 left-6 flex flex-col gap-2"
      >
        {/* Playback row */}
        <div className="glassmorphism rounded-xl px-4 py-2.5 flex items-center gap-4">
          <button
            type="button"
            data-ocid="controls.pause_button"
            onClick={sim.togglePause}
            className="text-primary hover:text-primary/80 transition-colors"
            aria-label={sim.paused ? "Play" : "Pause"}
          >
            {sim.paused ? <Play size={16} /> : <Pause size={16} />}
          </button>

          <SpeedControl
            timeScale={sim.timeScale}
            setTimeScale={sim.setTimeScale}
          />

          <div className="w-px h-4 bg-border/40" />

          <button
            type="button"
            data-ocid="controls.labels_toggle"
            onClick={sim.toggleLabels}
            className={`transition-colors ${sim.showLabels ? "text-primary" : "text-muted-foreground"}`}
            aria-label="Toggle labels"
            title="Toggle labels"
          >
            {sim.showLabels ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>

          <button
            type="button"
            data-ocid="controls.orbits_toggle"
            onClick={sim.toggleOrbits}
            className={`transition-colors ${sim.showOrbits ? "text-primary" : "text-muted-foreground"}`}
            aria-label="Toggle orbits"
            title="Toggle orbits"
          >
            {sim.showOrbits ? <Circle size={15} /> : <GitBranch size={15} />}
          </button>

          <button
            type="button"
            data-ocid="controls.reset_button"
            onClick={() => {
              sim.reset();
              sim.selectBody(null);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Reset"
            title="Reset"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* ── Body list (bottom-right) ────────────────────────────────────── */}
      <div
        data-ocid="body_list.panel"
        className="absolute bottom-6 right-6 flex flex-col gap-2 items-end"
      >
        <Button
          data-ocid="body_list.toggle"
          variant="outline"
          size="sm"
          onClick={() => setShowBodyList((v) => !v)}
          className="glassmorphism border-0 font-mono text-xs gap-2"
        >
          <Info size={13} />
          Bodies
        </Button>

        {showBodyList && (
          <div className="glassmorphism rounded-xl p-3 w-48 fade-in max-h-80 overflow-y-auto">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Planets
            </p>
            <div className="space-y-0.5">
              <button
                type="button"
                data-ocid="body_list.item.0"
                onClick={() => sim.selectBody("sun")}
                className={`w-full text-left text-xs px-2 py-1 rounded transition-colors flex items-center gap-2 ${
                  sim.selectedBodyId === "sun"
                    ? "bg-primary/20 text-primary"
                    : "hover:bg-muted/40 text-foreground"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block shrink-0"
                  style={{ background: SUN.color }}
                />
                {SUN.name}
              </button>
              {allPlanets.map((p, i) => (
                <button
                  type="button"
                  key={p.id}
                  data-ocid={`body_list.item.${i + 1}`}
                  onClick={() => sim.selectBody(p.id)}
                  className={`w-full text-left text-xs px-2 py-1 rounded transition-colors flex items-center gap-2 ${
                    sim.selectedBodyId === p.id
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-muted/40 text-foreground"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block shrink-0"
                    style={{ background: p.color }}
                  />
                  {p.name}
                </button>
              ))}
            </div>

            {moonsForSelected.length > 0 && (
              <>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-3 mb-2">
                  Moons
                </p>
                <div className="space-y-0.5">
                  {moonsForSelected.map((m, i) => (
                    <button
                      type="button"
                      key={m.id}
                      data-ocid={`body_list.moon.${i + 1}`}
                      onClick={() => sim.selectBody(m.id)}
                      className={`w-full text-left text-xs px-2 py-1 rounded transition-colors flex items-center gap-2 ${
                        sim.selectedBodyId === m.id
                          ? "bg-accent/20 text-accent-foreground"
                          : "hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full inline-block shrink-0 ml-1"
                        style={{ background: m.color }}
                      />
                      {m.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Info panel for selected body (top-right) ───────────────────── */}
      {sim.selectedBodyId && (
        <div className="absolute top-6 right-6">
          <InfoPanel
            bodyId={sim.selectedBodyId}
            onClose={() => sim.selectBody(null)}
          />
        </div>
      )}

      {/* ── Title / brand (top-left) ────────────────────────────────────── */}
      <div
        data-ocid="header.title"
        className="absolute top-6 left-6 glassmorphism rounded-xl px-4 py-2.5"
      >
        <h1 className="font-display font-semibold text-sm text-foreground tracking-wide">
          Solar System
        </h1>
        <p className="text-xs font-mono text-muted-foreground">
          Click any body to focus
        </p>
      </div>
    </div>
  );
}

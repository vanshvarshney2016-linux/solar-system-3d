import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { SolarSystemStore } from "@/types/solar-system";
import type { LucideProps } from "lucide-react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GitBranch,
  GitCommit,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";

interface ControlPanelProps {
  store: Pick<
    SolarSystemStore,
    | "paused"
    | "timeScale"
    | "showLabels"
    | "showOrbits"
    | "togglePause"
    | "setTimeScale"
    | "toggleLabels"
    | "toggleOrbits"
    | "reset"
  >;
}

function IconToggleRow({
  active,
  onClick,
  activeIcon: ActiveIcon,
  inactiveIcon: InactiveIcon,
  label,
  ocid,
}: {
  active: boolean;
  onClick: () => void;
  activeIcon: React.FC<LucideProps>;
  inactiveIcon: React.FC<LucideProps>;
  label: string;
  ocid: string;
}) {
  const Icon = active ? ActiveIcon : InactiveIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={ocid}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-mono w-full transition-all duration-200",
        "border border-transparent",
        active
          ? "text-[oklch(0.82_0.18_200)] bg-[oklch(0.82_0.18_200/0.08)] border-[oklch(0.82_0.18_200/0.25)] hover:bg-[oklch(0.82_0.18_200/0.14)]"
          : "text-muted-foreground bg-muted/20 hover:bg-muted/40 hover:text-foreground/70",
      )}
      aria-pressed={active}
    >
      <Icon size={14} className="shrink-0" />
      <span className="tracking-wider uppercase">{label}</span>
      <span
        className={cn(
          "ml-auto text-[10px] rounded px-1.5 py-0.5 font-bold",
          active
            ? "text-[oklch(0.82_0.18_200)] bg-[oklch(0.82_0.18_200/0.15)]"
            : "text-muted-foreground bg-muted/30",
        )}
      >
        {active ? "ON" : "OFF"}
      </span>
    </button>
  );
}

export function ControlPanel({ store }: ControlPanelProps) {
  const {
    paused,
    timeScale,
    showLabels,
    showOrbits,
    togglePause,
    setTimeScale,
    toggleLabels,
    toggleOrbits,
    reset,
  } = store;

  const [collapsed, setCollapsed] = useState(false);

  const logScale = (val: number) => {
    // Map 0-100 slider → 0.1-10 log scale
    const min = Math.log(0.1);
    const max = Math.log(10);
    return Math.exp(min + ((max - min) * val) / 100);
  };

  const toSlider = (scale: number) => {
    const min = Math.log(0.1);
    const max = Math.log(10);
    return ((Math.log(scale) - min) / (max - min)) * 100;
  };

  const handleSliderChange = (val: number[]) => {
    setTimeScale(logScale(val[0]));
  };

  const formatTimeScale = (scale: number) => {
    if (scale < 1) return `${scale.toFixed(1)}×`;
    if (scale >= 10) return `${scale.toFixed(0)}×`;
    return `${scale.toFixed(1)}×`;
  };

  return (
    <div
      data-ocid="control_panel"
      className={cn(
        "fixed bottom-5 left-5 z-50",
        "w-[220px] sm:w-[240px]",
        "rounded-xl overflow-hidden",
        "glassmorphism",
        "border border-[oklch(0.82_0.18_200/0.18)] shadow-[0_8px_40px_oklch(0_0_0/0.6),inset_0_1px_0_oklch(1_0_0/0.06)]",
        "fade-in",
      )}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[oklch(0.82_0.18_200/0.12)]">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[oklch(0.82_0.18_200)] shadow-[0_0_6px_oklch(0.82_0.18_200)]" />
          <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-[oklch(0.82_0.18_200/0.9)]">
            Mission Control
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          data-ocid="control_panel.toggle"
          className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
          aria-label={collapsed ? "Expand controls" : "Collapse controls"}
        >
          {collapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Collapsible body */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          collapsed ? "max-h-0" : "max-h-96",
        )}
      >
        <div className="p-3 flex flex-col gap-3">
          {/* Play / Pause */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePause}
              data-ocid="control_panel.pause_button"
              className={cn(
                "h-9 w-9 rounded-lg border transition-all duration-200",
                paused
                  ? "border-[oklch(0.72_0.20_45/0.5)] text-[oklch(0.72_0.20_45)] bg-[oklch(0.72_0.20_45/0.08)] hover:bg-[oklch(0.72_0.20_45/0.16)] shadow-[0_0_10px_oklch(0.72_0.20_45/0.25)]"
                  : "border-[oklch(0.82_0.18_200/0.3)] text-[oklch(0.82_0.18_200)] bg-[oklch(0.82_0.18_200/0.05)] hover:bg-[oklch(0.82_0.18_200/0.12)]",
              )}
              aria-label={paused ? "Play simulation" : "Pause simulation"}
            >
              {paused ? (
                <Play size={16} className="ml-0.5" />
              ) : (
                <Pause size={16} />
              )}
            </Button>
            <div className="flex-1 font-mono text-xs text-muted-foreground">
              {paused ? (
                <span className="text-[oklch(0.72_0.20_45)] tracking-wide">
                  PAUSED
                </span>
              ) : (
                <span className="text-[oklch(0.82_0.18_200/0.8)] tracking-wide">
                  RUNNING
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={reset}
              data-ocid="control_panel.reset_button"
              className="h-8 w-8 rounded-lg border border-muted/30 text-muted-foreground hover:border-[oklch(0.82_0.18_200/0.3)] hover:text-[oklch(0.82_0.18_200)] hover:bg-[oklch(0.82_0.18_200/0.07)] transition-all duration-200"
              aria-label="Reset camera to overview"
            >
              <RotateCcw size={13} />
            </Button>
          </div>

          {/* Separator */}
          <div className="border-t border-[oklch(0.82_0.18_200/0.08)]" />

          {/* Time scale */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-[0.12em] uppercase text-muted-foreground">
                Time Scale
              </span>
              <span
                className="text-[11px] font-mono font-bold text-[oklch(0.82_0.18_200)] tabular-nums min-w-[34px] text-right"
                data-ocid="control_panel.timescale_label"
              >
                {formatTimeScale(timeScale)}
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[toSlider(timeScale)]}
              onValueChange={handleSliderChange}
              data-ocid="control_panel.timescale_slider"
              className="[&_[data-slot=slider-range]]:bg-[oklch(0.82_0.18_200)] [&_[data-slot=slider-thumb]]:border-[oklch(0.82_0.18_200)] [&_[data-slot=slider-thumb]]:shadow-[0_0_6px_oklch(0.82_0.18_200/0.6)]"
            />
            <div className="flex justify-between text-[9px] font-mono text-muted-foreground/50 px-0.5">
              <span>0.1×</span>
              <span>1×</span>
              <span>10×</span>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-[oklch(0.82_0.18_200/0.08)]" />

          {/* Toggles */}
          <div className="flex flex-col gap-1.5">
            <IconToggleRow
              active={showOrbits}
              onClick={toggleOrbits}
              activeIcon={GitBranch}
              inactiveIcon={GitCommit}
              label="Orbit Paths"
              ocid="control_panel.orbits_toggle"
            />
            <IconToggleRow
              active={showLabels}
              onClick={toggleLabels}
              activeIcon={Eye}
              inactiveIcon={EyeOff}
              label="Labels"
              ocid="control_panel.labels_toggle"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

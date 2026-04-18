import { cn } from "@/lib/utils";
import type { BodyType, CelestialBody } from "@/types/solar-system";
import type { LucideProps } from "lucide-react";
import { Disc, Globe, Moon, Star, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SelectedBodyInfoProps {
  body: CelestialBody | null;
  onDismiss: () => void;
}

const BODY_TYPE_META: Record<
  BodyType,
  { label: string; Icon: React.FC<LucideProps>; colorClass: string }
> = {
  star: {
    label: "Star",
    Icon: Star,
    colorClass: "text-[oklch(0.85_0.22_55)]",
  },
  planet: {
    label: "Planet",
    Icon: Globe,
    colorClass: "text-[oklch(0.82_0.18_200)]",
  },
  moon: {
    label: "Moon",
    Icon: Moon,
    colorClass: "text-[oklch(0.75_0.08_240)]",
  },
  "dwarf-planet": {
    label: "Dwarf Planet",
    Icon: Disc,
    colorClass: "text-[oklch(0.70_0.12_170)]",
  },
};

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1 border-b border-[oklch(0.82_0.18_200/0.07)] last:border-0">
      <span className="text-[10px] font-mono tracking-[0.1em] uppercase text-muted-foreground shrink-0">
        {label}
      </span>
      <span className="text-[11px] font-mono text-foreground/90 text-right truncate min-w-0">
        {value}
      </span>
    </div>
  );
}

export function SelectedBodyInfo({ body, onDismiss }: SelectedBodyInfoProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Animate in/out
  useEffect(() => {
    if (body) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [body]);

  // Click-away to dismiss
  useEffect(() => {
    if (!body) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onDismiss();
      }
    };
    // Delay so the selection click itself doesn't immediately dismiss
    const timer = setTimeout(() => {
      document.addEventListener("pointerdown", handleClick);
    }, 150);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointerdown", handleClick);
    };
  }, [body, onDismiss]);

  if (!mounted || !body) return null;

  const typeMeta = BODY_TYPE_META[body.type];
  const { Icon, label: typeLabel, colorClass } = typeMeta;

  const orbitDays = body.orbital.period;
  const orbitStr =
    orbitDays < 1
      ? `${(orbitDays * 24).toFixed(1)} h`
      : orbitDays < 365
        ? `${orbitDays.toFixed(1)} d`
        : `${(orbitDays / 365.25).toFixed(2)} yr`;

  const distAU = body.orbital.semiMajorAxis;
  const distStr =
    body.type === "moon"
      ? `${distAU.toFixed(0)} 000 km`
      : `${distAU.toFixed(3)} AU`;

  return (
    <div
      ref={panelRef}
      data-ocid="selected_body.panel"
      className={cn(
        "fixed top-5 left-5 z-50",
        "w-[220px] sm:w-[248px]",
        "rounded-xl overflow-hidden",
        "glassmorphism",
        "border border-[oklch(0.82_0.18_200/0.18)] shadow-[0_8px_40px_oklch(0_0_0/0.6),inset_0_1px_0_oklch(1_0_0/0.06)]",
        "transition-all duration-300 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-3.5 pt-3 pb-2.5 border-b border-[oklch(0.82_0.18_200/0.1)]">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className={cn("flex items-center gap-1.5", colorClass)}>
            <Icon size={13} className="shrink-0" />
            <span className="text-[10px] font-mono tracking-[0.15em] uppercase opacity-80">
              {typeLabel}
            </span>
          </div>
          <h2 className="text-base font-display font-semibold text-foreground leading-tight truncate">
            {body.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          data-ocid="selected_body.close_button"
          className="mt-0.5 ml-2 shrink-0 text-muted-foreground hover:text-foreground rounded-md p-0.5 transition-colors"
          aria-label="Dismiss body info"
        >
          <X size={14} />
        </button>
      </div>

      {/* Color swatch + stats */}
      <div className="px-3.5 py-2.5 flex flex-col gap-0.5">
        {/* Visual accent: body color dot */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm"
            style={{ background: body.color }}
          />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-muted/40 to-transparent" />
          {body.hasRings && (
            <span className="text-[9px] font-mono text-[oklch(0.72_0.20_45)] uppercase tracking-wider">
              Rings
            </span>
          )}
        </div>

        <StatRow label="Orbit Period" value={orbitStr} />
        <StatRow label="Distance" value={distStr} />
        {body.type !== "moon" && (
          <StatRow label="Radius" value={`${body.radiusEarth.toFixed(3)} R⊕`} />
        )}
        {body.axialTilt !== 0 && (
          <StatRow label="Axial Tilt" value={`${body.axialTilt.toFixed(1)}°`} />
        )}
        {body.moonIds && body.moonIds.length > 0 && (
          <StatRow label="Moons" value={`${body.moonIds.length}`} />
        )}
      </div>

      {/* Fun fact */}
      {body.fact && (
        <div className="mx-3 mb-3 px-3 py-2.5 rounded-lg bg-[oklch(0.82_0.18_200/0.05)] border border-[oklch(0.82_0.18_200/0.12)]">
          <p className="text-[11px] leading-relaxed text-muted-foreground italic">
            &ldquo;{body.fact}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}

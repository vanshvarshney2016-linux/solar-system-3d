import { cn } from "@/lib/utils";

interface SceneTitleProps {
  className?: string;
}

export function SceneTitle({ className }: SceneTitleProps) {
  return (
    <div
      data-ocid="scene_title"
      className={cn(
        "fixed top-5 left-1/2 -translate-x-1/2 z-50",
        "flex flex-col items-center gap-1",
        "pointer-events-none select-none",
        "fade-in",
        className,
      )}
    >
      {/* Decorative line + dot */}
      <div className="flex items-center gap-2 mb-0.5">
        <div className="h-px w-10 bg-gradient-to-r from-transparent to-[oklch(0.82_0.18_200/0.5)]" />
        <div className="h-1 w-1 rounded-full bg-[oklch(0.82_0.18_200/0.7)] shadow-[0_0_6px_oklch(0.82_0.18_200)]" />
        <div className="h-px w-10 bg-gradient-to-l from-transparent to-[oklch(0.82_0.18_200/0.5)]" />
      </div>

      {/* Title */}
      <h1
        className="
          font-display font-semibold tracking-[0.35em] uppercase
          text-sm sm:text-base
          text-transparent bg-clip-text
          bg-gradient-to-b from-foreground/95 to-foreground/50
          leading-none
        "
      >
        Solar System
      </h1>

      {/* Subtitle / tagline */}
      <p className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] uppercase text-[oklch(0.82_0.18_200/0.55)]">
        Interactive 3D Model
      </p>
    </div>
  );
}

import type { CelestialBody } from "@/types/solar-system";
import { Html } from "@react-three/drei";

interface BodyLabelProps {
  body: CelestialBody;
  offset?: [number, number, number];
  selected?: boolean;
}

export function BodyLabel({
  body,
  offset = [0, 0, 0],
  selected = false,
}: BodyLabelProps) {
  const isMoon = body.type === "moon";

  return (
    <Html
      position={offset}
      center
      style={{ pointerEvents: "none", userSelect: "none" }}
      zIndexRange={[0, 10]}
      occlude={false}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "2px 7px",
          borderRadius: "100px",
          background: selected
            ? "oklch(0.58 0.21 264 / 0.35)"
            : "oklch(0.08 0 0 / 0.55)",
          border: `1px solid ${
            selected
              ? "oklch(0.58 0.21 264 / 0.7)"
              : isMoon
                ? "oklch(0.3 0.01 264 / 0.5)"
                : "oklch(0.35 0.01 264 / 0.5)"
          }`,
          backdropFilter: "blur(4px)",
          whiteSpace: "nowrap",
          transition: "all 0.2s ease",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: isMoon ? "5px" : "7px",
            height: isMoon ? "5px" : "7px",
            borderRadius: "50%",
            background: body.color,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: isMoon ? "9px" : "11px",
            fontWeight: 500,
            color: selected
              ? "oklch(0.85 0.12 264)"
              : isMoon
                ? "oklch(0.65 0 0)"
                : "oklch(0.88 0 0)",
            letterSpacing: "0.03em",
          }}
        >
          {body.name}
        </span>
      </div>
    </Html>
  );
}

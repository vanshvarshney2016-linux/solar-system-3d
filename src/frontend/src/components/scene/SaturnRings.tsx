import { useMemo } from "react";
import * as THREE from "three";

interface SaturnRingsProps {
  innerRadius: number;
  outerRadius: number;
  color?: string;
  opacity?: number;
  segments?: number;
}

export function SaturnRings({
  innerRadius,
  outerRadius,
  color = "#C8A86A",
  opacity = 0.72,
  segments = 96,
}: SaturnRingsProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(innerRadius, outerRadius, segments, 6);

    // Reorder UVs so the texture maps radially (useful if a texture is applied)
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const uv = geo.attributes.uv as THREE.BufferAttribute;
    const v3 = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      const r = v3.length();
      const norm = (r - innerRadius) / (outerRadius - innerRadius);
      uv.setXY(i, norm, norm);
    }
    uv.needsUpdate = true;
    return geo;
  }, [innerRadius, outerRadius, segments]);

  // Build a canvas texture for a banded ring look
  const texture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, size, 0);
    grad.addColorStop(0, "rgba(200,168,106,0)");
    grad.addColorStop(0.05, "rgba(200,168,106,0.6)");
    grad.addColorStop(0.2, "rgba(230,200,140,0.85)");
    grad.addColorStop(0.35, "rgba(200,168,106,0.55)");
    grad.addColorStop(0.5, "rgba(240,220,160,0.95)");
    grad.addColorStop(0.65, "rgba(190,155,95,0.65)");
    grad.addColorStop(0.8, "rgba(215,185,120,0.8)");
    grad.addColorStop(0.92, "rgba(170,140,80,0.45)");
    grad.addColorStop(1, "rgba(200,168,106,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, 1);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, []);

  return (
    <mesh geometry={geometry} rotation={[Math.PI / 2, 0, 0]}>
      <meshBasicMaterial
        map={texture}
        color={color}
        side={THREE.DoubleSide}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </mesh>
  );
}

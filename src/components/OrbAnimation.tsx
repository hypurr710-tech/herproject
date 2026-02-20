"use client";

import { useEffect, useRef } from "react";

interface OrbAnimationProps {
  state: "idle" | "listening" | "speaking" | "thinking";
  size?: number;
}

// Bezier curve points for a feminine bust/head silhouette
function getSilhouettePoints(cx: number, cy: number, scale: number) {
  // Generates a series of points forming an abstract feminine head+shoulder silhouette
  const s = scale;
  return {
    // Head outline (top of head down to chin)
    head: [
      { x: cx, y: cy - s * 1.35 },           // top of head
      { x: cx + s * 0.38, y: cy - s * 1.32 }, // right top curve
      { x: cx + s * 0.52, y: cy - s * 1.1 },  // right temple
      { x: cx + s * 0.48, y: cy - s * 0.8 },  // right cheek high
      { x: cx + s * 0.42, y: cy - s * 0.55 }, // right cheek
      { x: cx + s * 0.32, y: cy - s * 0.38 }, // right jaw
      { x: cx + s * 0.18, y: cy - s * 0.28 }, // right chin
      { x: cx, y: cy - s * 0.24 },            // chin center
      { x: cx - s * 0.18, y: cy - s * 0.28 }, // left chin
      { x: cx - s * 0.32, y: cy - s * 0.38 }, // left jaw
      { x: cx - s * 0.42, y: cy - s * 0.55 }, // left cheek
      { x: cx - s * 0.48, y: cy - s * 0.8 },  // left cheek high
      { x: cx - s * 0.52, y: cy - s * 1.1 },  // left temple
      { x: cx - s * 0.38, y: cy - s * 1.32 }, // left top curve
    ],
    // Neck
    neck: [
      { x: cx + s * 0.12, y: cy - s * 0.24 },
      { x: cx + s * 0.14, y: cy - s * 0.05 },
      { x: cx - s * 0.14, y: cy - s * 0.05 },
      { x: cx - s * 0.12, y: cy - s * 0.24 },
    ],
    // Shoulders (gentle curve outward)
    shoulders: [
      { x: cx - s * 0.14, y: cy - s * 0.05 },
      { x: cx - s * 0.35, y: cy + s * 0.08 },
      { x: cx - s * 0.7, y: cy + s * 0.25 },
      { x: cx - s * 0.95, y: cy + s * 0.55 },
      { x: cx - s * 0.85, y: cy + s * 0.75 },
      // bottom sweep
      { x: cx + s * 0.85, y: cy + s * 0.75 },
      { x: cx + s * 0.95, y: cy + s * 0.55 },
      { x: cx + s * 0.7, y: cy + s * 0.25 },
      { x: cx + s * 0.35, y: cy + s * 0.08 },
      { x: cx + s * 0.14, y: cy - s * 0.05 },
    ],
  };
}

// Smooth catmull-rom spline through points
function drawSmoothCurve(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  closed: boolean = true
) {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? (closed ? points.length - 1 : 0) : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 >= points.length ? (closed ? (i + 2) % points.length : points.length - 1) : i + 2];

    const tension = 0.3;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }

  if (closed) ctx.closePath();
}

// Interpolate a point along a path at parameter t (0-1)
function getPointOnPath(points: { x: number; y: number }[], t: number) {
  const totalLen = points.length - 1;
  const idx = Math.min(Math.floor(t * totalLen), totalLen - 1);
  const localT = (t * totalLen) - idx;
  const p1 = points[idx];
  const p2 = points[idx + 1] || points[idx];
  return {
    x: p1.x + (p2.x - p1.x) * localT,
    y: p1.y + (p2.y - p1.y) * localT,
  };
}

interface FlowParticle {
  path: "head" | "shoulders";
  t: number;
  speed: number;
  offset: number;
  size: number;
  hue: number;
  alpha: number;
}

interface FloatingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  hue: number;
}

export default function OrbAnimation({ state, size = 260 }: OrbAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const flowParticlesRef = useRef<FlowParticle[]>([]);
  const floatingParticlesRef = useRef<FloatingParticle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const canvasW = size * 2;
    const canvasH = size * 2.4;
    canvas.width = canvasW * dpr;
    canvas.height = canvasH * dpr;
    ctx.scale(dpr, dpr);

    const cx = canvasW / 2;
    const cy = canvasH * 0.42;
    const figureScale = size * 0.72;

    // Initialize flow particles
    if (flowParticlesRef.current.length === 0) {
      for (let i = 0; i < 120; i++) {
        flowParticlesRef.current.push({
          path: Math.random() < 0.55 ? "head" : "shoulders",
          t: Math.random(),
          speed: 0.001 + Math.random() * 0.003,
          offset: (Math.random() - 0.5) * figureScale * 0.12,
          size: 0.5 + Math.random() * 2,
          hue: [260, 280, 300, 320, 200, 220][Math.floor(Math.random() * 6)],
          alpha: 0.3 + Math.random() * 0.5,
        });
      }
    }

    const flowParticles = flowParticlesRef.current;
    const floatingParticles = floatingParticlesRef.current;

    const draw = () => {
      timeRef.current += 0.006;
      const t = timeRef.current;

      ctx.clearRect(0, 0, canvasW, canvasH);

      // State-driven parameters
      let energy = 0.25;
      let breathSpeed = 1.2;
      let particleIntensity = 0.4;
      let glowIntensity = 0.5;

      if (state === "listening") {
        energy = 0.8;
        breathSpeed = 2.0;
        particleIntensity = 0.85;
        glowIntensity = 0.8;
      } else if (state === "speaking") {
        energy = 0.65;
        breathSpeed = 1.5;
        particleIntensity = 0.7;
        glowIntensity = 0.7;
      } else if (state === "thinking") {
        energy = 0.5;
        breathSpeed = 3.0;
        particleIntensity = 0.6;
        glowIntensity = 0.6;
      }

      // Breathing animation
      const breath = Math.sin(t * breathSpeed) * 0.015 * (1 + energy);
      const currentScale = figureScale * (1 + breath);

      // Get silhouette points with animation
      const sil = getSilhouettePoints(cx, cy, currentScale);

      // Animate points with gentle sway
      const animatePoints = (pts: { x: number; y: number }[]) =>
        pts.map((p, i) => ({
          x: p.x + Math.sin(t * 1.5 + i * 0.5) * currentScale * 0.008 * energy,
          y: p.y + Math.cos(t * 1.2 + i * 0.3) * currentScale * 0.005 * energy,
        }));

      const headPts = animatePoints(sil.head);
      const shoulderPts = animatePoints(sil.shoulders);

      // === AMBIENT GLOW ===
      const ambientR = currentScale * 2.0;
      const ambient = ctx.createRadialGradient(cx, cy - currentScale * 0.3, currentScale * 0.2, cx, cy, ambientR);
      ambient.addColorStop(0, `rgba(167, 139, 250, ${0.05 + glowIntensity * 0.06})`);
      ambient.addColorStop(0.3, `rgba(196, 130, 250, ${0.03 + glowIntensity * 0.04})`);
      ambient.addColorStop(0.6, `rgba(100, 140, 255, ${0.015 + glowIntensity * 0.02})`);
      ambient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = ambient;
      ctx.fillRect(0, 0, canvasW, canvasH);

      // === SILHOUETTE BODY FILL (ethereal glass) ===
      ctx.save();

      // Shoulder/body fill
      drawSmoothCurve(ctx, shoulderPts, true);
      const bodyGrad = ctx.createLinearGradient(cx, cy - currentScale * 0.1, cx, cy + currentScale * 0.8);
      bodyGrad.addColorStop(0, `rgba(167, 139, 250, ${0.06 + energy * 0.04})`);
      bodyGrad.addColorStop(0.5, `rgba(139, 92, 246, ${0.04 + energy * 0.03})`);
      bodyGrad.addColorStop(1, `rgba(100, 120, 220, ${0.01})`);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Head fill
      drawSmoothCurve(ctx, headPts, true);
      const headGrad = ctx.createRadialGradient(
        cx, cy - currentScale * 0.8, currentScale * 0.05,
        cx, cy - currentScale * 0.7, currentScale * 0.65
      );
      headGrad.addColorStop(0, `rgba(200, 180, 255, ${0.1 + energy * 0.06})`);
      headGrad.addColorStop(0.5, `rgba(167, 139, 250, ${0.06 + energy * 0.04})`);
      headGrad.addColorStop(1, `rgba(130, 100, 220, ${0.02})`);
      ctx.fillStyle = headGrad;
      ctx.fill();

      ctx.restore();

      // === SILHOUETTE OUTLINE (glowing edges) ===
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // Head outline
      drawSmoothCurve(ctx, headPts, true);
      ctx.strokeStyle = `rgba(167, 139, 250, ${0.2 + energy * 0.2 + Math.sin(t * 2) * 0.05})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "rgba(167, 139, 250, 0.5)";
      ctx.shadowBlur = 12 + energy * 8;
      ctx.stroke();

      // Neck connection
      const neckPts = animatePoints(sil.neck);
      ctx.beginPath();
      ctx.moveTo(neckPts[0].x, neckPts[0].y);
      for (let i = 1; i < neckPts.length; i++) {
        ctx.lineTo(neckPts[i].x, neckPts[i].y);
      }
      ctx.strokeStyle = `rgba(167, 139, 250, ${0.12 + energy * 0.1})`;
      ctx.lineWidth = 1.2;
      ctx.shadowBlur = 8 + energy * 6;
      ctx.stroke();

      // Shoulder outline
      drawSmoothCurve(ctx, shoulderPts, false);
      ctx.strokeStyle = `rgba(139, 120, 240, ${0.15 + energy * 0.15 + Math.sin(t * 1.8 + 1) * 0.04})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "rgba(139, 92, 246, 0.4)";
      ctx.shadowBlur = 10 + energy * 6;
      ctx.stroke();

      ctx.restore();

      // === FACE FEATURES (minimal, abstract) ===
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const faceAlpha = 0.08 + energy * 0.06 + Math.sin(t * 1.5) * 0.02;

      // Eyes - two soft glowing dots
      const eyeY = cy - currentScale * 0.85;
      const eyeSpacing = currentScale * 0.15;
      const eyeSize = currentScale * 0.025;

      [cx - eyeSpacing, cx + eyeSpacing].forEach((ex) => {
        const eyeGlow = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, eyeSize * 4);
        eyeGlow.addColorStop(0, `rgba(220, 200, 255, ${faceAlpha * 2.5})`);
        eyeGlow.addColorStop(0.4, `rgba(167, 139, 250, ${faceAlpha * 1.2})`);
        eyeGlow.addColorStop(1, "rgba(167, 139, 250, 0)");
        ctx.fillStyle = eyeGlow;
        ctx.beginPath();
        ctx.arc(ex, eyeY, eyeSize * 4, 0, Math.PI * 2);
        ctx.fill();

        // Bright center
        ctx.fillStyle = `rgba(255, 255, 255, ${faceAlpha * 2})`;
        ctx.beginPath();
        ctx.arc(ex, eyeY, eyeSize * 0.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Lips - subtle curved line
      const lipY = cy - currentScale * 0.45;
      const lipWidth = currentScale * 0.1;
      const lipCurve = state === "speaking"
        ? Math.sin(t * 8) * currentScale * 0.015
        : currentScale * 0.01;

      ctx.beginPath();
      ctx.moveTo(cx - lipWidth, lipY);
      ctx.quadraticCurveTo(cx, lipY + lipCurve, cx + lipWidth, lipY);
      ctx.strokeStyle = `rgba(244, 160, 200, ${faceAlpha * 1.5})`;
      ctx.lineWidth = 1.2;
      ctx.shadowColor = "rgba(244, 114, 182, 0.3)";
      ctx.shadowBlur = 6;
      ctx.stroke();

      ctx.restore();

      // === FLOW PARTICLES (trace along silhouette) ===
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      flowParticles.forEach((fp) => {
        fp.t += fp.speed * (1 + energy * 1.5);
        if (fp.t > 1) fp.t -= 1;

        const pathPts = fp.path === "head" ? headPts : shoulderPts;
        const pos = getPointOnPath(pathPts, fp.t);

        // Add perpendicular offset
        const nextT = Math.min(fp.t + 0.02, 0.99);
        const nextPos = getPointOnPath(pathPts, nextT);
        const dx = nextPos.x - pos.x;
        const dy = nextPos.y - pos.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;

        const px = pos.x + nx * fp.offset;
        const py = pos.y + ny * fp.offset;

        const flicker = Math.sin(t * 12 + fp.t * 20) * 0.3 + 0.7;
        const alpha = fp.alpha * particleIntensity * flicker;

        const grad = ctx.createRadialGradient(px, py, 0, px, py, fp.size * 3);
        grad.addColorStop(0, `hsla(${fp.hue}, 80%, 75%, ${alpha})`);
        grad.addColorStop(0.5, `hsla(${fp.hue}, 70%, 60%, ${alpha * 0.4})`);
        grad.addColorStop(1, `hsla(${fp.hue}, 60%, 50%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, fp.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(px, py, fp.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();

      // === FLOATING PARTICLES (ethereal dust rising) ===
      if (Math.random() < 0.12 + energy * 0.25) {
        const spawnX = cx + (Math.random() - 0.5) * currentScale * 1.6;
        const spawnY = cy + currentScale * (0.3 + Math.random() * 0.4);
        floatingParticles.push({
          x: spawnX,
          y: spawnY,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -(0.2 + Math.random() * 0.5),
          size: 0.5 + Math.random() * 1.8,
          life: 1,
          maxLife: 80 + Math.random() * 120,
          hue: [260, 280, 300, 320, 200][Math.floor(Math.random() * 5)],
        });
      }

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (let i = floatingParticles.length - 1; i >= 0; i--) {
        const fp = floatingParticles[i];
        fp.x += fp.vx + Math.sin(t * 2 + i) * 0.15;
        fp.y += fp.vy;
        fp.life -= 1 / fp.maxLife;

        if (fp.life <= 0) {
          floatingParticles.splice(i, 1);
          continue;
        }

        const fadeIn = Math.min(1, (1 - fp.life) * 5);
        const fadeOut = Math.min(1, fp.life * 3);
        const alpha = fadeIn * fadeOut * (0.4 + energy * 0.4);

        const grad = ctx.createRadialGradient(fp.x, fp.y, 0, fp.x, fp.y, fp.size * 3);
        grad.addColorStop(0, `hsla(${fp.hue}, 75%, 75%, ${alpha})`);
        grad.addColorStop(0.5, `hsla(${fp.hue}, 65%, 60%, ${alpha * 0.3})`);
        grad.addColorStop(1, `hsla(${fp.hue}, 55%, 50%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(fp.x, fp.y, fp.size * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(fp.x, fp.y, fp.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      if (floatingParticles.length > 100) floatingParticles.splice(0, floatingParticles.length - 100);
      ctx.restore();

      // === INNER GLOW (core light in chest area) ===
      const coreY = cy + currentScale * 0.15;
      const coreR = currentScale * 0.25;
      const corePulse = 1 + Math.sin(t * breathSpeed * 1.5) * 0.15 * (1 + energy);
      const coreGrad = ctx.createRadialGradient(cx, coreY, 0, cx, coreY, coreR * corePulse);
      coreGrad.addColorStop(0, `rgba(200, 180, 255, ${0.12 + energy * 0.1})`);
      coreGrad.addColorStop(0.4, `rgba(167, 139, 250, ${0.05 + energy * 0.04})`);
      coreGrad.addColorStop(1, "rgba(167, 139, 250, 0)");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, coreY, coreR * corePulse, 0, Math.PI * 2);
      ctx.fill();

      // === HEAD HALO (crown light) ===
      const haloY = cy - currentScale * 1.4;
      const haloR = currentScale * 0.5;
      const haloGrad = ctx.createRadialGradient(cx, haloY, 0, cx, haloY, haloR);
      haloGrad.addColorStop(0, `rgba(200, 180, 255, ${0.04 + energy * 0.04})`);
      haloGrad.addColorStop(0.5, `rgba(167, 139, 250, ${0.02 + energy * 0.02})`);
      haloGrad.addColorStop(1, "rgba(167, 139, 250, 0)");
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(cx, haloY, haloR, 0, Math.PI * 2);
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [state, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size * 2,
        height: size * 2.4,
      }}
    />
  );
}

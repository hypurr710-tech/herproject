"use client";

import { useEffect, useRef } from "react";

interface OrbAnimationProps {
  state: "idle" | "listening" | "speaking" | "thinking";
  size?: number;
}

export default function OrbAnimation({ state, size = 260 }: OrbAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const canvasSize = size * 2;
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    ctx.scale(dpr, dpr);

    const cx = canvasSize / 2;
    const cy = canvasSize / 2;
    const baseRadius = size * 0.36;

    // Color blobs - Siri-like multi-color
    const blobs = [
      { h: 260, s: 80, l: 68, angle: 0, speed: 0.35, radius: 0.55, phase: 0, wobble: 0.025 },
      { h: 330, s: 75, l: 68, angle: Math.PI * 0.33, speed: 0.45, radius: 0.5, phase: 1.2, wobble: 0.03 },
      { h: 200, s: 85, l: 62, angle: Math.PI * 0.66, speed: 0.3, radius: 0.48, phase: 2.4, wobble: 0.028 },
      { h: 280, s: 72, l: 65, angle: Math.PI, speed: 0.4, radius: 0.52, phase: 3.6, wobble: 0.022 },
      { h: 350, s: 78, l: 70, angle: Math.PI * 1.33, speed: 0.5, radius: 0.45, phase: 4.8, wobble: 0.035 },
      { h: 170, s: 72, l: 58, angle: Math.PI * 1.66, speed: 0.38, radius: 0.47, phase: 5.5, wobble: 0.026 },
    ];

    // Sparkle particles
    const sparkles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }[] = [];

    const draw = () => {
      timeRef.current += 0.008;
      const t = timeRef.current;

      ctx.clearRect(0, 0, canvasSize, canvasSize);

      // State params
      let energy = 0.3;
      let speedMult = 1;
      let wobbleMult = 1;

      if (state === "listening") {
        energy = 0.75;
        speedMult = 1.6;
        wobbleMult = 2.0;
      } else if (state === "speaking") {
        energy = 0.65;
        speedMult = 1.2;
        wobbleMult = 1.5 + Math.sin(t * 8) * 0.5;
      } else if (state === "thinking") {
        energy = 0.55;
        speedMult = 2.5;
        wobbleMult = 1.2;
      }

      const pulse = 1 + Math.sin(t * (1.5 + energy * 2)) * (0.03 + energy * 0.06);
      const r = baseRadius * pulse;

      // === OUTER GLOW ===
      const glowR = r * (1.8 + energy * 0.5);
      const glow = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, glowR);
      glow.addColorStop(0, `rgba(167, 139, 250, ${0.06 + energy * 0.08})`);
      glow.addColorStop(0.4, `rgba(244, 114, 182, ${0.03 + energy * 0.04})`);
      glow.addColorStop(0.7, `rgba(100, 180, 255, ${0.02 + energy * 0.02})`);
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // === BLOB LAYERS (screen blend) ===
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      blobs.forEach((blob) => {
        const bt = t * blob.speed * speedMult + blob.phase;

        const wAmt = state === "speaking"
          ? 0.15 + Math.sin(t * 8 + blob.phase) * 0.1
          : energy * 0.25 * wobbleMult;

        const blobR = r * blob.radius * (1 + Math.sin(bt * 2) * wAmt);

        const orbitR = r * 0.3 * energy;
        const bx = cx + Math.cos(bt + blob.angle) * orbitR;
        const by = cy + Math.sin(bt * 0.8 + blob.angle) * orbitR;

        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, blobR);
        const lightShift = Math.sin(bt) * 8;
        grad.addColorStop(0, `hsla(${blob.h}, ${blob.s}%, ${blob.l + lightShift}%, ${0.55 + energy * 0.35})`);
        grad.addColorStop(0.5, `hsla(${blob.h}, ${blob.s}%, ${blob.l - 8}%, ${0.2 + energy * 0.15})`);
        grad.addColorStop(1, `hsla(${blob.h}, ${blob.s}%, ${blob.l - 20}%, 0)`);

        ctx.beginPath();
        ctx.arc(bx, by, blobR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      ctx.restore();

      // === BRIGHT CENTER CORE ===
      const coreR = r * 0.4;
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      core.addColorStop(0, `rgba(255, 255, 255, ${0.28 + energy * 0.22})`);
      core.addColorStop(0.3, `rgba(220, 200, 255, ${0.12 + energy * 0.1})`);
      core.addColorStop(0.7, `rgba(180, 160, 255, ${0.04 + energy * 0.03})`);
      core.addColorStop(1, "rgba(180, 160, 255, 0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      // === GLASS RIM HIGHLIGHT ===
      const rimAngle = t * 0.3;
      const rimX = cx + Math.cos(rimAngle) * r * 0.15;
      const rimY = cy - r * 0.22 + Math.sin(rimAngle * 0.7) * r * 0.05;
      const rim = ctx.createRadialGradient(rimX, rimY, 0, rimX, rimY, r * 0.55);
      rim.addColorStop(0, "rgba(255, 255, 255, 0.15)");
      rim.addColorStop(0.5, "rgba(255, 255, 255, 0.04)");
      rim.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(rimX, rimY, r * 0.55, 0, Math.PI * 2);
      ctx.fill();

      // === SPARKLE PARTICLES ===
      // Spawn new sparkles
      if (Math.random() < 0.15 + energy * 0.4) {
        const angle = Math.random() * Math.PI * 2;
        const dist = r * (0.6 + Math.random() * 0.8);
        sparkles.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3 - 0.15,
          life: 1,
          maxLife: 60 + Math.random() * 80,
          size: 0.8 + Math.random() * 1.5,
        });
      }

      // Draw & update sparkles
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 1 / s.maxLife;

        if (s.life <= 0) {
          sparkles.splice(i, 1);
          continue;
        }

        const twinkle = Math.sin(t * 20 + i * 3) * 0.5 + 0.5;
        const alpha = s.life * twinkle * (0.5 + energy * 0.5);

        // Star shape glow
        const sGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3);
        sGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        sGrad.addColorStop(0.3, `rgba(200, 180, 255, ${alpha * 0.5})`);
        sGrad.addColorStop(1, "rgba(200, 180, 255, 0)");
        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Bright center dot
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Keep sparkles manageable
      if (sparkles.length > 80) sparkles.splice(0, sparkles.length - 80);

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
        height: size * 2,
      }}
    />
  );
}

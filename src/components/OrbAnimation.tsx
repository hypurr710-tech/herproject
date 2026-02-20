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
    const baseRadius = size * 0.38;

    // Particle system
    const particles: { angle: number; dist: number; speed: number; size: number; opacity: number; phase: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        dist: baseRadius + 20 + Math.random() * 80,
        speed: 0.002 + Math.random() * 0.008,
        size: 1 + Math.random() * 2.5,
        opacity: 0.2 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;

      ctx.clearRect(0, 0, canvasSize, canvasSize);

      // State-dependent parameters
      let pulseSpeed = 1.5;
      let pulseAmp = 0.06;
      let glowIntensity = 0.4;
      let innerBrightness = 1.0;
      let rotationSpeed = 0.3;
      let particleActivity = 0.5;

      if (state === "listening") {
        pulseSpeed = 3.0;
        pulseAmp = 0.12;
        glowIntensity = 0.7;
        innerBrightness = 1.3;
        rotationSpeed = 0.8;
        particleActivity = 1.0;
      } else if (state === "speaking") {
        pulseSpeed = 2.0;
        pulseAmp = 0.08 + Math.sin(t * 5) * 0.04;
        glowIntensity = 0.6;
        innerBrightness = 1.2;
        rotationSpeed = 0.5;
        particleActivity = 0.8;
      } else if (state === "thinking") {
        pulseSpeed = 4.0;
        pulseAmp = 0.04;
        glowIntensity = 0.5;
        innerBrightness = 1.1;
        rotationSpeed = 1.2;
        particleActivity = 0.6;
      }

      const pulse = 1 + Math.sin(t * pulseSpeed) * pulseAmp;
      const r = baseRadius * pulse;

      // === OUTER GLOW (large, soft) ===
      const outerGlow = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 2.5);
      outerGlow.addColorStop(0, `rgba(232, 88, 79, ${glowIntensity * 0.3})`);
      outerGlow.addColorStop(0.3, `rgba(220, 60, 50, ${glowIntensity * 0.15})`);
      outerGlow.addColorStop(0.6, `rgba(180, 40, 60, ${glowIntensity * 0.05})`);
      outerGlow.addColorStop(1, "rgba(180, 40, 60, 0)");
      ctx.fillStyle = outerGlow;
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // === MID GLOW ===
      const midGlow = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.6);
      midGlow.addColorStop(0, `rgba(232, 88, 79, ${glowIntensity * 0.4})`);
      midGlow.addColorStop(0.5, `rgba(210, 70, 60, ${glowIntensity * 0.2})`);
      midGlow.addColorStop(1, "rgba(200, 50, 50, 0)");
      ctx.fillStyle = midGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // === MAIN ORB BODY ===
      // Deformed circle for organic feel
      ctx.save();
      ctx.beginPath();
      const points = 100;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const deform = 1 +
          Math.sin(angle * 3 + t * rotationSpeed) * 0.02 +
          Math.sin(angle * 5 - t * rotationSpeed * 1.3) * 0.015 +
          Math.sin(angle * 7 + t * rotationSpeed * 0.7) * 0.01;
        const px = cx + Math.cos(angle) * r * deform;
        const py = cy + Math.sin(angle) * r * deform;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.clip();

      // Main gradient fill
      const mainGrad = ctx.createRadialGradient(
        cx - r * 0.3, cy - r * 0.3, 0,
        cx, cy, r * 1.1
      );
      mainGrad.addColorStop(0, `rgba(255, 140, 120, ${innerBrightness})`);
      mainGrad.addColorStop(0.25, `rgba(232, 88, 79, ${innerBrightness})`);
      mainGrad.addColorStop(0.55, `rgba(200, 60, 55, ${innerBrightness})`);
      mainGrad.addColorStop(0.8, `rgba(160, 40, 50, ${innerBrightness * 0.9})`);
      mainGrad.addColorStop(1, `rgba(120, 25, 40, ${innerBrightness * 0.8})`);
      ctx.fillStyle = mainGrad;
      ctx.fillRect(cx - r * 1.2, cy - r * 1.2, r * 2.4, r * 2.4);

      // Internal swirl layers
      for (let layer = 0; layer < 3; layer++) {
        const swirl = ctx.createRadialGradient(
          cx + Math.cos(t * (0.5 + layer * 0.3) + layer * 2) * r * 0.4,
          cy + Math.sin(t * (0.4 + layer * 0.2) + layer * 2) * r * 0.4,
          0,
          cx, cy, r
        );
        const alpha = 0.15 + Math.sin(t * (1 + layer * 0.5)) * 0.08;
        swirl.addColorStop(0, `rgba(255, 180, 160, ${alpha})`);
        swirl.addColorStop(0.4, `rgba(232, 100, 90, ${alpha * 0.5})`);
        swirl.addColorStop(1, "rgba(200, 60, 50, 0)");
        ctx.fillStyle = swirl;
        ctx.fillRect(cx - r * 1.2, cy - r * 1.2, r * 2.4, r * 2.4);
      }

      // Specular highlight
      const specGrad = ctx.createRadialGradient(
        cx - r * 0.25, cy - r * 0.3, 0,
        cx - r * 0.2, cy - r * 0.2, r * 0.7
      );
      specGrad.addColorStop(0, "rgba(255, 255, 255, 0.25)");
      specGrad.addColorStop(0.3, "rgba(255, 220, 210, 0.1)");
      specGrad.addColorStop(1, "rgba(255, 200, 190, 0)");
      ctx.fillStyle = specGrad;
      ctx.fillRect(cx - r * 1.2, cy - r * 1.2, r * 2.4, r * 2.4);

      ctx.restore();

      // === RING GLOW ===
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(232, 88, 79, ${0.3 + Math.sin(t * 2) * 0.1})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // === PARTICLES ===
      particles.forEach((p) => {
        p.angle += p.speed * particleActivity;
        const breathe = 1 + Math.sin(t * 1.5 + p.phase) * 0.15;
        const px = cx + Math.cos(p.angle) * p.dist * breathe;
        const py = cy + Math.sin(p.angle) * p.dist * breathe;
        const alpha = p.opacity * (0.5 + Math.sin(t * 2 + p.phase) * 0.5) * particleActivity;

        const pGrad = ctx.createRadialGradient(px, py, 0, px, py, p.size * 2);
        pGrad.addColorStop(0, `rgba(232, 120, 100, ${alpha})`);
        pGrad.addColorStop(1, "rgba(232, 88, 79, 0)");
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(px, py, p.size * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 200, 180, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // === ORBITAL RING ===
      ctx.save();
      ctx.globalAlpha = 0.15 + Math.sin(t) * 0.05;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.35, r * 0.3, t * rotationSpeed * 0.2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 180, 160, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

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
        filter: "saturate(1.2)",
      }}
    />
  );
}

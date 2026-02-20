"use client";

import { useRef, useEffect, useCallback } from "react";

interface ThreadAnimationProps {
  state: "idle" | "listening" | "speaking" | "thinking";
}

function noise(x: number): number {
  const xi = Math.floor(x);
  const xf = x - xi;
  const t = xf * xf * (3 - 2 * xf);
  const a = Math.sin(xi * 127.1 + 311.7) * 43758.5453;
  const b = Math.sin((xi + 1) * 127.1 + 311.7) * 43758.5453;
  return (a - Math.floor(a)) * (1 - t) + (b - Math.floor(b)) * t;
}

export default function OrbAnimation({ state }: ThreadAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const animFrameRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;

    const dpr = window.devicePixelRatio || 1;
    if (
      canvas.width !== rect.width * dpr ||
      canvas.height !== rect.height * dpr
    ) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    timeRef.current += 0.016;
    const t = timeRef.current;

    let speed: number,
      amplitude: number,
      noiseAmt: number,
      lineWidth: number,
      glowSize: number,
      segments: number,
      loopCount: number;

    switch (state) {
      case "listening":
        speed = 1.8;
        amplitude = 0.85;
        noiseAmt = 0.25;
        lineWidth = 2.0;
        glowSize = 12;
        segments = 200;
        loopCount = 3;
        break;
      case "speaking":
        speed = 2.8;
        amplitude = 1.1;
        noiseAmt = 0.4;
        lineWidth = 2.5;
        glowSize = 18;
        segments = 250;
        loopCount = 4;
        break;
      case "thinking":
        speed = 0.6;
        amplitude = 0.55;
        noiseAmt = 0.15;
        lineWidth = 1.5;
        glowSize = 8;
        segments = 180;
        loopCount = 2;
        break;
      default:
        speed = 0.4;
        amplitude = 0.5;
        noiseAmt = 0.1;
        lineWidth = 1.5;
        glowSize = 6;
        segments = 160;
        loopCount = 2;
    }

    const scaleX = w * 0.32 * amplitude;
    const scaleY = h * 0.28 * amplitude;

    for (let layer = 0; layer < loopCount; layer++) {
      const layerOffset = layer * 0.4;
      const layerAlpha = 1.0 - layer * 0.2;

      // Glow layer
      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.06 * layerAlpha})`;
      ctx.lineWidth = lineWidth + glowSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();

      for (let i = 0; i <= segments; i++) {
        const p = (i / segments) * Math.PI * 2;
        const nt = t * speed + layerOffset;

        const denom = 1 + Math.sin(p) * Math.sin(p);
        let x = cx + (Math.cos(p) / denom) * scaleX;
        let y = cy + ((Math.sin(p) * Math.cos(p)) / denom) * scaleY;

        const n1 = noise(p * 2 + nt) - 0.5;
        const n2 = noise(p * 2 + nt + 100) - 0.5;
        x += n1 * scaleX * noiseAmt;
        y += n2 * scaleY * noiseAmt;

        const breath = Math.sin(nt * 0.5 + p * 0.5) * 4;
        x += breath * Math.cos(p);
        y += breath * Math.sin(p);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // Main line
      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, ${(0.7 + (state === "speaking" ? 0.2 : 0)) * layerAlpha})`;
      ctx.lineWidth = lineWidth - layer * 0.3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();

      for (let i = 0; i <= segments; i++) {
        const p = (i / segments) * Math.PI * 2;
        const nt = t * speed + layerOffset;

        const denom = 1 + Math.sin(p) * Math.sin(p);
        let x = cx + (Math.cos(p) / denom) * scaleX;
        let y = cy + ((Math.sin(p) * Math.cos(p)) / denom) * scaleY;

        const n1 = noise(p * 2 + nt) - 0.5;
        const n2 = noise(p * 2 + nt + 100) - 0.5;
        x += n1 * scaleX * noiseAmt;
        y += n2 * scaleY * noiseAmt;

        const breath = Math.sin(nt * 0.5 + p * 0.5) * 4;
        x += breath * Math.cos(p);
        y += breath * Math.sin(p);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Center glow
    if (state !== "idle") {
      const glowAlpha = state === "speaking" ? 0.12 : 0.06;
      const glowR = state === "speaking" ? 40 : 25;
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${glowAlpha})`);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fill();
    }

    animFrameRef.current = requestAnimationFrame(draw);
  }, [state]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  return (
    <div className="w-[280px] h-[180px] flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

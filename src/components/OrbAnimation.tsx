"use client";

import { useRef, useEffect, useCallback } from "react";

interface ThreadAnimationProps {
  state: "idle" | "listening" | "speaking" | "thinking";
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

    // State-based parameters (kept subtle)
    let speed: number, wobble: number, lineW: number, glowAlpha: number;

    switch (state) {
      case "listening":
        speed = 0.8;
        wobble = 6;
        lineW = 1.8;
        glowAlpha = 0.08;
        break;
      case "speaking":
        speed = 1.4;
        wobble = 10;
        lineW = 2.0;
        glowAlpha = 0.12;
        break;
      case "thinking":
        speed = 0.3;
        wobble = 3;
        lineW = 1.2;
        glowAlpha = 0.05;
        break;
      default: // idle
        speed = 0.2;
        wobble = 2;
        lineW = 1.2;
        glowAlpha = 0.0;
    }

    const rx = w * 0.3; // horizontal radius
    const ry = h * 0.22; // vertical radius
    const segments = 300;

    // Generate smooth points along a lemniscate (infinity curve)
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= segments; i++) {
      const p = (i / segments) * Math.PI * 2;
      const denom = 1 + Math.sin(p) * Math.sin(p);

      // Base lemniscate
      let x = cx + (Math.cos(p) / denom) * rx;
      let y = cy + ((Math.sin(p) * Math.cos(p)) / denom) * ry;

      // Gentle sine-based wobble (smooth, not noisy)
      const wt = t * speed;
      x += Math.sin(p * 3 + wt * 1.7) * wobble * 0.6;
      y += Math.cos(p * 2 + wt * 1.3) * wobble * 0.8;

      // Subtle breathing
      const breath = Math.sin(wt * 0.4) * 2;
      x += breath * Math.cos(p) * 0.5;
      y += breath * Math.sin(p) * 0.5;

      points.push({ x, y });
    }

    // Draw soft glow (single pass, wide + transparent)
    if (glowAlpha > 0) {
      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, ${glowAlpha})`;
      ctx.lineWidth = lineW + 8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Draw the main clean line
    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 255, 0.85)`;
    ctx.lineWidth = lineW;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.restore();

    animFrameRef.current = requestAnimationFrame(draw);
  }, [state]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  return (
    <div className="w-[260px] h-[140px] flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

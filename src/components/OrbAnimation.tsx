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

    // Very subtle state-based parameters
    let speed: number, drift: number, lineW: number, alpha: number;

    switch (state) {
      case "listening":
        speed = 0.5;
        drift = 1.5;
        lineW = 1.5;
        alpha = 0.9;
        break;
      case "speaking":
        speed = 0.8;
        drift = 2.5;
        lineW = 1.8;
        alpha = 0.95;
        break;
      case "thinking":
        speed = 0.2;
        drift = 0.8;
        lineW = 1.2;
        alpha = 0.7;
        break;
      default: // idle
        speed = 0.15;
        drift = 0.5;
        lineW = 1.2;
        alpha = 0.75;
    }

    const rx = w * 0.28;
    const ry = h * 0.2;
    const segments = 200;
    const wt = t * speed;

    // Generate clean lemniscate points with only very gentle drift
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= segments; i++) {
      const p = (i / segments) * Math.PI * 2;
      const denom = 1 + Math.sin(p) * Math.sin(p);

      // Clean lemniscate base shape
      const bx = (Math.cos(p) / denom) * rx;
      const by = ((Math.sin(p) * Math.cos(p)) / denom) * ry;

      // Single low-frequency sine drift (one gentle wave across the whole shape)
      const dx = Math.sin(p + wt) * drift;
      const dy = Math.cos(p * 0.5 + wt * 0.7) * drift * 0.6;

      points.push({ x: cx + bx + dx, y: cy + by + dy });
    }

    // Soft glow (only when active)
    if (state !== "idle") {
      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, 0.06)`;
      ctx.lineWidth = lineW + 6;
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

    // Single clean line
    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
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
    <div className="w-[240px] h-[120px] flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

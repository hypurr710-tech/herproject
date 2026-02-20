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
    const baseR = size * 0.52;

    // 12 control points around the blob for wobble
    const blobPoints = 12;
    const blobPhases: number[] = [];
    const blobSpeeds: number[] = [];
    const blobAmps: number[] = [];
    for (let i = 0; i < blobPoints; i++) {
      blobPhases.push(Math.random() * Math.PI * 2);
      blobSpeeds.push(0.8 + Math.random() * 1.2);
      blobAmps.push(0.03 + Math.random() * 0.04);
    }

    const draw = () => {
      timeRef.current += 0.012;
      const t = timeRef.current;

      ctx.clearRect(0, 0, canvasSize, canvasSize);

      // State-driven parameters
      let wobbleAmt = 1.0;
      let squish = 0;
      let bounceSpeed = 1.5;
      let glowAlpha = 0.15;
      let mouthOpen = 0;
      let eyeSquint = 0;
      let blush = 0;

      if (state === "listening") {
        wobbleAmt = 2.5;
        bounceSpeed = 2.5;
        glowAlpha = 0.25;
        eyeSquint = 0.2;
        blush = 0.3;
      } else if (state === "speaking") {
        wobbleAmt = 1.8;
        bounceSpeed = 2.0;
        glowAlpha = 0.2;
        mouthOpen = Math.abs(Math.sin(t * 6)) * 0.6 + 0.1;
        blush = 0.15;
      } else if (state === "thinking") {
        wobbleAmt = 1.2;
        bounceSpeed = 3.5;
        glowAlpha = 0.18;
        squish = Math.sin(t * 3) * 0.03;
      }

      // Breathing / bounce
      const breathX = 1 + squish + Math.sin(t * bounceSpeed) * 0.02;
      const breathY = 1 - squish + Math.sin(t * bounceSpeed) * -0.025;

      // === SHADOW ===
      const shadowW = baseR * 0.9 * breathX;
      const shadowH = baseR * 0.12;
      const shadowY = cy + baseR * breathY * 0.9 + 8;
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = "#6b21a8";
      ctx.beginPath();
      ctx.ellipse(cx, shadowY, shadowW, shadowH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // === OUTER GLOW ===
      const glowR = baseR * 1.8;
      const glow = ctx.createRadialGradient(cx, cy, baseR * 0.3, cx, cy, glowR);
      glow.addColorStop(0, `rgba(192, 160, 255, ${glowAlpha})`);
      glow.addColorStop(0.5, `rgba(167, 139, 250, ${glowAlpha * 0.4})`);
      glow.addColorStop(1, "rgba(167, 139, 250, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // === DITTO BLOB BODY ===
      // Generate wobbling blob path
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(breathX, breathY);

      // Build blob path with bezier curves
      const points: { x: number; y: number }[] = [];
      for (let i = 0; i < blobPoints; i++) {
        const angle = (i / blobPoints) * Math.PI * 2 - Math.PI / 2;
        const wobble = Math.sin(t * blobSpeeds[i] + blobPhases[i]) * blobAmps[i] * wobbleAmt;
        const r = baseR * (1 + wobble);

        // Slight vertical asymmetry - flatter bottom, rounder top (like Ditto)
        const yFactor = Math.sin(angle) > 0.3 ? 0.92 : 1.0;
        points.push({
          x: Math.cos(angle) * r,
          y: Math.sin(angle) * r * yFactor,
        });
      }

      // Draw smooth blob
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const p0 = points[(i - 1 + points.length) % points.length];
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        const p3 = points[(i + 2) % points.length];

        if (i === 0) ctx.moveTo(p1.x, p1.y);

        const tension = 0.3;
        ctx.bezierCurveTo(
          p1.x + (p2.x - p0.x) * tension,
          p1.y + (p2.y - p0.y) * tension,
          p2.x - (p3.x - p1.x) * tension,
          p2.y - (p3.y - p1.y) * tension,
          p2.x,
          p2.y
        );
      }
      ctx.closePath();

      // Ditto purple gradient fill
      const bodyGrad = ctx.createRadialGradient(
        -baseR * 0.2, -baseR * 0.3, baseR * 0.1,
        0, 0, baseR * 1.1
      );
      bodyGrad.addColorStop(0, "#d8b4fe");  // lighter center
      bodyGrad.addColorStop(0.3, "#c084fc"); // main purple
      bodyGrad.addColorStop(0.7, "#a855f7"); // deeper purple
      bodyGrad.addColorStop(1, "#9333ea");   // edge purple
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Subtle outline
      ctx.strokeStyle = "rgba(107, 33, 168, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // === HIGHLIGHT / SHINE ===
      const shineX = -baseR * 0.25;
      const shineY = -baseR * 0.35;
      const shineR = baseR * 0.5;
      const shine = ctx.createRadialGradient(shineX, shineY, 0, shineX, shineY, shineR);
      shine.addColorStop(0, "rgba(255, 255, 255, 0.35)");
      shine.addColorStop(0.4, "rgba(255, 255, 255, 0.1)");
      shine.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = shine;
      ctx.beginPath();
      ctx.arc(shineX, shineY, shineR, 0, Math.PI * 2);
      ctx.fill();

      // Small specular dot
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.beginPath();
      ctx.arc(shineX + baseR * 0.05, shineY + baseR * 0.05, baseR * 0.06, 0, Math.PI * 2);
      ctx.fill();

      // === FACE ===
      const faceOffsetY = -baseR * 0.08;

      // Eyes - small black dots (Ditto style)
      const eyeSpacing = baseR * 0.18;
      const eyeY = faceOffsetY - baseR * 0.08;
      const eyeR = baseR * 0.055;
      const eyeSquishY = 1 - eyeSquint * 0.3;

      // Left eye
      ctx.fillStyle = "#1a1a2e";
      ctx.save();
      ctx.translate(-eyeSpacing, eyeY);
      ctx.scale(1, eyeSquishY);
      ctx.beginPath();
      ctx.arc(0, 0, eyeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Tiny eye highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.beginPath();
      ctx.arc(-eyeSpacing + eyeR * 0.3, eyeY - eyeR * 0.3, eyeR * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Right eye
      ctx.fillStyle = "#1a1a2e";
      ctx.save();
      ctx.translate(eyeSpacing, eyeY);
      ctx.scale(1, eyeSquishY);
      ctx.beginPath();
      ctx.arc(0, 0, eyeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Tiny eye highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.beginPath();
      ctx.arc(eyeSpacing + eyeR * 0.3, eyeY - eyeR * 0.3, eyeR * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Mouth - curved smile (Ditto style)
      const mouthY = faceOffsetY + baseR * 0.12;
      const mouthW = baseR * 0.22;

      ctx.strokeStyle = "#581c87";
      ctx.lineWidth = baseR * 0.025;
      ctx.lineCap = "round";
      ctx.beginPath();

      if (mouthOpen > 0.15) {
        // Open mouth (speaking) - oval shape
        const openH = baseR * 0.08 * mouthOpen;
        ctx.ellipse(0, mouthY, mouthW * 0.6, openH, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#3b0764";
        ctx.fill();
        ctx.stroke();
      } else {
        // Closed smile curve
        ctx.moveTo(-mouthW, mouthY);
        ctx.quadraticCurveTo(0, mouthY + baseR * 0.12, mouthW, mouthY);
        ctx.stroke();
      }

      // Blush circles
      if (blush > 0) {
        const blushR = baseR * 0.09;
        const blushY = faceOffsetY + baseR * 0.06;
        ctx.globalAlpha = blush;

        ctx.fillStyle = "rgba(251, 113, 133, 0.5)";
        ctx.beginPath();
        ctx.arc(-eyeSpacing - baseR * 0.05, blushY, blushR, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(eyeSpacing + baseR * 0.05, blushY, blushR, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Thinking state: "..." dots above head
      if (state === "thinking") {
        const dotY = -baseR * 0.85;
        const dotR = baseR * 0.035;
        for (let i = 0; i < 3; i++) {
          const delay = i * 0.3;
          const bounce = Math.sin(t * 4 + delay) * baseR * 0.04;
          const alpha = 0.4 + Math.sin(t * 3 + i) * 0.2;
          ctx.fillStyle = `rgba(147, 51, 234, ${alpha})`;
          ctx.beginPath();
          ctx.arc((i - 1) * baseR * 0.1, dotY + bounce, dotR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

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
      }}
    />
  );
}

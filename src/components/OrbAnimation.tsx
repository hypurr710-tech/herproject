"use client";

import Image from "next/image";

interface OrbAnimationProps {
  state: "idle" | "listening" | "speaking" | "thinking";
  size?: number;
}

export default function OrbAnimation({ state, size = 260 }: OrbAnimationProps) {
  const imgSize = size * 1.2;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size * 2, height: size * 1.8 }}
    >
      {/* Purple glow behind */}
      <div
        className={`absolute rounded-full transition-opacity duration-700 ${
          state === "listening"
            ? "opacity-60"
            : state === "speaking"
            ? "opacity-50"
            : state === "thinking"
            ? "opacity-40"
            : "opacity-15"
        }`}
        style={{
          width: imgSize * 1.5,
          height: imgSize * 1.5,
          background: "radial-gradient(circle, rgba(167,139,250,0.35) 0%, rgba(139,92,246,0.12) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Shadow */}
      <div
        className="absolute rounded-full bg-purple-900/25 transition-all duration-300"
        style={{
          bottom: "8%",
          width: imgSize * 0.6,
          height: imgSize * 0.06,
          filter: "blur(10px)",
        }}
      />

      {/* Ditto image */}
      <div
        className={`relative ditto-${state}`}
        style={{
          width: imgSize,
          height: imgSize,
          transformOrigin: "center bottom",
        }}
      >
        <Image
          src="/ditto.png"
          alt="Ditto"
          width={475}
          height={475}
          className="w-full h-full object-contain"
          style={{
            filter: "drop-shadow(0 0 30px rgba(167,139,250,0.35)) blur(0.4px)",
          }}
          priority
        />
      </div>

      {/* Thinking dots */}
      {state === "thinking" && (
        <div className="absolute top-[5%] flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-purple-400"
              style={{
                animation: `thinkBounce 1.2s ease-in-out ${i * 0.25}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .ditto-idle {
          animation: none;
        }
        .ditto-listening {
          animation: dittoListen 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .ditto-speaking {
          animation: dittoSpeak 0.9s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .ditto-thinking {
          animation: dittoThink 3s ease-in-out infinite;
        }

        @keyframes dittoListen {
          0% { transform: translateY(0) scaleX(1) scaleY(1) rotate(0deg); }
          8% { transform: translateY(4px) scaleX(1.12) scaleY(0.88) rotate(0deg); }
          20% { transform: translateY(-14px) scaleX(0.9) scaleY(1.12) rotate(-2deg); }
          35% { transform: translateY(3px) scaleX(1.08) scaleY(0.92) rotate(1deg); }
          50% { transform: translateY(-8px) scaleX(0.94) scaleY(1.06) rotate(-1deg); }
          65% { transform: translateY(2px) scaleX(1.05) scaleY(0.95) rotate(1deg); }
          80% { transform: translateY(-4px) scaleX(0.97) scaleY(1.03) rotate(0deg); }
          100% { transform: translateY(0) scaleX(1) scaleY(1) rotate(0deg); }
        }

        @keyframes dittoSpeak {
          0% { transform: translateY(0) scaleX(1) scaleY(1) rotate(0deg); }
          10% { transform: translateY(2px) scaleX(1.06) scaleY(0.94) rotate(0deg); }
          25% { transform: translateY(-8px) scaleX(0.94) scaleY(1.07) rotate(-1.5deg); }
          40% { transform: translateY(1px) scaleX(1.04) scaleY(0.96) rotate(0.5deg); }
          55% { transform: translateY(-5px) scaleX(0.96) scaleY(1.04) rotate(1deg); }
          70% { transform: translateY(2px) scaleX(1.03) scaleY(0.97) rotate(-0.5deg); }
          85% { transform: translateY(-3px) scaleX(0.98) scaleY(1.02) rotate(0deg); }
          100% { transform: translateY(0) scaleX(1) scaleY(1) rotate(0deg); }
        }

        @keyframes dittoThink {
          0%, 100% { transform: translateY(0) scaleX(1) scaleY(1) rotate(0deg); }
          15% { transform: translateY(-3px) scaleX(0.97) scaleY(1.03) rotate(-3deg); }
          30% { transform: translateY(-5px) scaleX(1.01) scaleY(0.99) rotate(-5deg); }
          50% { transform: translateY(-2px) scaleX(1.03) scaleY(0.97) rotate(0deg); }
          65% { transform: translateY(-4px) scaleX(0.98) scaleY(1.02) rotate(4deg); }
          80% { transform: translateY(-1px) scaleX(1.01) scaleY(0.99) rotate(2deg); }
        }

        @keyframes thinkBounce {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

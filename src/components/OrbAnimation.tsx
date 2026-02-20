"use client";

import Image from "next/image";

interface OrbAnimationProps {
  state: "idle" | "listening" | "speaking" | "thinking";
  size?: number;
}

export default function OrbAnimation({ state, size = 260 }: OrbAnimationProps) {
  const imgSize = size * 1.4;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size * 2, height: size * 2 }}
    >
      {/* Purple glow behind */}
      <div
        className={`absolute rounded-full blur-3xl transition-opacity duration-500 ${
          state === "listening"
            ? "opacity-60"
            : state === "speaking"
            ? "opacity-45"
            : state === "thinking"
            ? "opacity-35"
            : "opacity-20"
        }`}
        style={{
          width: imgSize * 1.2,
          height: imgSize * 1.2,
          background: "radial-gradient(circle, rgba(167,139,250,0.5) 0%, rgba(139,92,246,0.2) 50%, transparent 70%)",
        }}
      />

      {/* Shadow */}
      <div
        className="absolute bottom-[15%] rounded-full bg-purple-900/20 blur-md"
        style={{
          width: imgSize * 0.7,
          height: imgSize * 0.08,
        }}
      />

      {/* Ditto image */}
      <div
        className={`relative ditto-${state}`}
        style={{ width: imgSize, height: imgSize }}
      >
        <Image
          src="/ditto.png"
          alt="Ditto"
          width={475}
          height={475}
          className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(167,139,250,0.3)]"
          priority
        />
      </div>

      {/* Thinking dots */}
      {state === "thinking" && (
        <div className="absolute top-[12%] flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-purple-400"
              style={{
                animation: `thinkBounce 1s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .ditto-idle {
          animation: dittoFloat 3s ease-in-out infinite;
        }
        .ditto-listening {
          animation: dittoWobble 0.6s ease-in-out infinite;
        }
        .ditto-speaking {
          animation: dittoSpeak 0.4s ease-in-out infinite;
        }
        .ditto-thinking {
          animation: dittoThink 2s ease-in-out infinite;
        }

        @keyframes dittoFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.02, 0.98); }
        }

        @keyframes dittoWobble {
          0%, 100% { transform: scale(1, 1) rotate(0deg); }
          25% { transform: scale(1.06, 0.94) rotate(-2deg); }
          50% { transform: scale(0.94, 1.06) rotate(0deg); }
          75% { transform: scale(1.04, 0.96) rotate(2deg); }
        }

        @keyframes dittoSpeak {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(1.03, 0.97); }
        }

        @keyframes dittoThink {
          0%, 100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-3px) scale(0.98, 1.02); }
          50% { transform: translateY(0) scale(1.02, 0.98); }
          75% { transform: translateY(-2px) scale(0.99, 1.01); }
        }

        @keyframes thinkBounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

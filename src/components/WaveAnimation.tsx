"use client";

interface WaveAnimationProps {
  isActive: boolean;
}

export default function WaveAnimation({ isActive }: WaveAnimationProps) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-[2px] rounded-full transition-all duration-300"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            height: isActive ? "100%" : "4px",
            animation: isActive
              ? `wave 1.2s ease-in-out ${i * 0.15}s infinite`
              : "none",
          }}
        />
      ))}
      <style jsx>{`
        @keyframes wave {
          0%,
          100% {
            height: 4px;
          }
          50% {
            height: 100%;
          }
        }
      `}</style>
    </div>
  );
}

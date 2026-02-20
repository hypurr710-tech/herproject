"use client";

import { TTSVoice } from "@/hooks/useSpeechSynthesis";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableVoices: TTSVoice[];
  voiceName: string;
  onVoiceChange: (voice: string) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  autoSpeak: boolean;
  onAutoSpeakChange: (value: boolean) => void;
  difficulty: "beginner" | "intermediate" | "advanced";
  onDifficultyChange: (d: "beginner" | "intermediate" | "advanced") => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  availableVoices,
  voiceName,
  onVoiceChange,
  speed,
  onSpeedChange,
  autoSpeak,
  onAutoSpeakChange,
  difficulty,
  onDifficultyChange,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#D4564E] rounded-3xl shadow-2xl w-full max-w-md border border-white/[0.12] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-light text-white tracking-wide">
              Settings
            </h2>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Difficulty */}
          <div className="mb-6">
            <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider font-light">
              Difficulty Level
            </label>
            <div className="flex gap-2">
              {(["beginner", "intermediate", "advanced"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => onDifficultyChange(d)}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-light transition-all ${
                    difficulty === d
                      ? "bg-white/20 text-white border border-white/25"
                      : "bg-white/[0.08] text-white/50 border border-transparent hover:bg-white/[0.12]"
                  }`}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Selection */}
          <div className="mb-6">
            <label className="text-xs text-white/40 mb-3 block uppercase tracking-wider font-light">
              Samantha Voice
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableVoices.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => onVoiceChange(voice.id)}
                  className={`py-3 px-4 rounded-xl text-left transition-all ${
                    voiceName === voice.id
                      ? "bg-white/20 text-white border border-white/25"
                      : "bg-white/[0.08] text-white/50 border border-transparent hover:bg-white/[0.12]"
                  }`}
                >
                  <div className="text-sm font-light">{voice.name}</div>
                  <div className="text-[11px] opacity-50 mt-0.5">
                    {voice.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Speed */}
          <div className="mb-6">
            <label className="text-xs text-white/40 mb-2 flex justify-between uppercase tracking-wider font-light">
              <span>Speed</span>
              <span className="text-white/35">{speed.toFixed(1)}x</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Auto Speak */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm text-white/90 font-light">
                Auto Speak
              </div>
              <div className="text-xs text-white/35 font-light">
                Automatically read AI responses aloud
              </div>
            </div>
            <button
              onClick={() => onAutoSpeakChange(!autoSpeak)}
              className={`w-12 h-7 rounded-full transition-all ${
                autoSpeak ? "bg-white/50" : "bg-white/20"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                  autoSpeak ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

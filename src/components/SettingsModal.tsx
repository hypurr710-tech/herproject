"use client";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (voice: SpeechSynthesisVoice) => void;
  rate: number;
  onRateChange: (rate: number) => void;
  pitch: number;
  onPitchChange: (pitch: number) => void;
  autoSpeak: boolean;
  onAutoSpeakChange: (value: boolean) => void;
  difficulty: "beginner" | "intermediate" | "advanced";
  onDifficultyChange: (d: "beginner" | "intermediate" | "advanced") => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  voices,
  selectedVoice,
  onVoiceChange,
  rate,
  onRateChange,
  pitch,
  onPitchChange,
  autoSpeak,
  onAutoSpeakChange,
  difficulty,
  onDifficultyChange,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#12121a] rounded-3xl shadow-2xl w-full max-w-md border border-white/10 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Settings</h2>
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
            <label className="text-sm text-white/60 mb-2 block">
              Difficulty Level
            </label>
            <div className="flex gap-2">
              {(["beginner", "intermediate", "advanced"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => onDifficultyChange(d)}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                    difficulty === d
                      ? "bg-purple-500 text-white"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  }`}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Selection */}
          <div className="mb-6">
            <label className="text-sm text-white/60 mb-2 block">Voice</label>
            <select
              className="w-full bg-white/10 text-white rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-purple-500/50"
              value={selectedVoice?.name || ""}
              onChange={(e) => {
                const voice = voices.find((v) => v.name === e.target.value);
                if (voice) onVoiceChange(voice);
              }}
            >
              {voices.map((voice) => (
                <option
                  key={voice.name}
                  value={voice.name}
                  className="bg-[#12121a]"
                >
                  {voice.name}
                </option>
              ))}
            </select>
          </div>

          {/* Speed */}
          <div className="mb-6">
            <label className="text-sm text-white/60 mb-2 flex justify-between">
              <span>Speed</span>
              <span className="text-white/40">{rate.toFixed(1)}x</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => onRateChange(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          {/* Pitch */}
          <div className="mb-6">
            <label className="text-sm text-white/60 mb-2 flex justify-between">
              <span>Pitch</span>
              <span className="text-white/40">{pitch.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => onPitchChange(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          {/* Auto Speak */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm text-white/90">Auto Speak</div>
              <div className="text-xs text-white/40">
                Automatically read AI responses aloud
              </div>
            </div>
            <button
              onClick={() => onAutoSpeakChange(!autoSpeak)}
              className={`w-12 h-7 rounded-full transition-all ${
                autoSpeak ? "bg-purple-500" : "bg-white/20"
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

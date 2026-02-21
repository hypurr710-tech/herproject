"use client";

import { useEffect, useState } from "react";
import { TTSVoice, TTSProvider } from "@/hooks/useSpeechSynthesis";
import { UserProfile } from "@/types";
import { getMemories, clearMemories, getConversations } from "@/lib/storage";

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
  userProfile: UserProfile | null;
  onEditProfile: () => void;
  ttsProvider: TTSProvider;
  onTtsProviderChange: (provider: TTSProvider) => void;
  elevenlabsVoiceId: string;
  onElevenlabsVoiceIdChange: (id: string) => void;
  elevenlabsVoices: TTSVoice[];
  onLoadElevenlabsVoices: () => Promise<void>;
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
  userProfile,
  onEditProfile,
  ttsProvider,
  onTtsProviderChange,
  elevenlabsVoiceId,
  onElevenlabsVoiceIdChange,
  elevenlabsVoices,
  onLoadElevenlabsVoices,
}: SettingsModalProps) {
  const [memoryCount, setMemoryCount] = useState(0);
  const [conversationCount, setConversationCount] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMemoryCount(getMemories().length);
      setConversationCount(getConversations().length);
      if (elevenlabsVoices.length === 0) {
        onLoadElevenlabsVoices();
      }
    }
  }, [isOpen, elevenlabsVoices.length, onLoadElevenlabsVoices]);

  if (!isOpen) return null;

  const handleClearMemories = () => {
    clearMemories();
    setMemoryCount(0);
    setShowClearConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#D4564E] rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md border border-white/[0.12] overflow-hidden max-h-[85dvh] flex flex-col">
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
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

          {/* User Profile Section */}
          <div className="mb-6">
            <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider font-light">
              Profile
            </label>
            <div className="bg-white/[0.08] rounded-xl p-4 border border-white/[0.1]">
              {userProfile?.name ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/90 font-light">
                      {userProfile.name}
                      {userProfile.nickname && (
                        <span className="text-white/40 ml-1">
                          ({userProfile.nickname})
                        </span>
                      )}
                    </div>
                    {userProfile.interests.length > 0 && (
                      <div className="text-xs text-white/35 mt-1 font-light">
                        {userProfile.interests.slice(0, 3).join(", ")}
                        {userProfile.interests.length > 3 && ` +${userProfile.interests.length - 3}`}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={onEditProfile}
                    className="text-xs text-white/50 hover:text-white/80 transition-colors px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12]"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <button
                  onClick={onEditProfile}
                  className="w-full text-sm text-white/50 hover:text-white/80 transition-colors py-1 font-light"
                >
                  Set up your profile for personalized conversations
                </button>
              )}
            </div>
          </div>

          {/* Memory Section */}
          <div className="mb-6">
            <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider font-light">
              Memory
            </label>
            <div className="bg-white/[0.08] rounded-xl p-4 border border-white/[0.1]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-white/70 font-light">
                  {memoryCount} memories from {conversationCount} conversations
                </div>
              </div>
              <p className="text-xs text-white/35 font-light mb-3">
                Her remembers key facts, preferences, and past conversations to personalize your experience.
              </p>
              {showClearConfirm ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleClearMemories}
                    className="flex-1 text-xs py-2 rounded-lg bg-red-500/30 text-red-200 hover:bg-red-500/40 transition-colors"
                  >
                    Confirm Clear
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 text-xs py-2 rounded-lg bg-white/[0.08] text-white/50 hover:bg-white/[0.12] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-xs text-white/35 hover:text-white/60 transition-colors"
                >
                  Clear all memories
                </button>
              )}
            </div>
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
                  className={`flex-1 py-2.5 sm:py-2 px-3 rounded-xl text-sm font-light transition-all active:scale-95 ${
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

          {/* TTS Provider */}
          <div className="mb-6">
            <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider font-light">
              Voice Engine
            </label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => onTtsProviderChange("openai")}
                className={`flex-1 py-2.5 sm:py-2 px-3 rounded-xl text-sm font-light transition-all active:scale-95 ${
                  ttsProvider === "openai"
                    ? "bg-white/20 text-white border border-white/25"
                    : "bg-white/[0.08] text-white/50 border border-transparent hover:bg-white/[0.12]"
                }`}
              >
                OpenAI
              </button>
              <button
                onClick={() => onTtsProviderChange("elevenlabs")}
                className={`flex-1 py-2.5 sm:py-2 px-3 rounded-xl text-sm font-light transition-all active:scale-95 ${
                  ttsProvider === "elevenlabs"
                    ? "bg-white/20 text-white border border-white/25"
                    : "bg-white/[0.08] text-white/50 border border-transparent hover:bg-white/[0.12]"
                }`}
              >
                ElevenLabs
              </button>
            </div>
            {ttsProvider === "elevenlabs" && (
              <p className="text-xs text-white/30 font-light">
                ElevenLabs supports voice cloning for custom voices. Set ELEVENLABS_API_KEY in .env.local.
              </p>
            )}
          </div>

          {/* Voice Selection */}
          <div className="mb-6">
            <label className="text-xs text-white/40 mb-3 block uppercase tracking-wider font-light">
              {ttsProvider === "elevenlabs" ? "ElevenLabs Voice" : "Voice"}
            </label>
            {ttsProvider === "openai" ? (
              <div className="grid grid-cols-2 gap-2">
                {availableVoices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => onVoiceChange(voice.id)}
                    className={`py-3.5 sm:py-3 px-4 rounded-xl text-left transition-all active:scale-95 ${
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
            ) : (
              <div className="space-y-2">
                {elevenlabsVoices.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {elevenlabsVoices.map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => onElevenlabsVoiceIdChange(voice.id)}
                        className={`py-3 px-4 rounded-xl text-left transition-all active:scale-95 ${
                          elevenlabsVoiceId === voice.id
                            ? "bg-white/20 text-white border border-white/25"
                            : "bg-white/[0.08] text-white/50 border border-transparent hover:bg-white/[0.12]"
                        }`}
                      >
                        <div className="text-sm font-light">{voice.name}</div>
                        {voice.description && (
                          <div className="text-[11px] opacity-50 mt-0.5 truncate">
                            {voice.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/[0.08] rounded-xl p-4 text-center">
                    <p className="text-xs text-white/40 font-light">
                      No ElevenLabs voices found. Configure your API key in .env.local.
                    </p>
                    <button
                      onClick={onLoadElevenlabsVoices}
                      className="mt-2 text-xs text-white/50 hover:text-white/80 transition-colors px-4 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12]"
                    >
                      Retry
                    </button>
                  </div>
                )}
                {/* Custom voice ID input */}
                <div>
                  <input
                    type="text"
                    value={elevenlabsVoiceId}
                    onChange={(e) => onElevenlabsVoiceIdChange(e.target.value)}
                    placeholder="Or paste a voice ID..."
                    className="w-full bg-white/[0.08] text-white placeholder:text-white/25 rounded-xl px-4 py-2.5 text-xs font-light border border-white/[0.1] focus:outline-none focus:border-white/25 transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Speed (only for OpenAI) */}
          {ttsProvider === "openai" && (
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
          )}

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
              className={`w-14 h-8 sm:w-12 sm:h-7 rounded-full transition-all ${
                autoSpeak ? "bg-white/50" : "bg-white/20"
              }`}
            >
              <div
                className={`w-6 h-6 sm:w-5 sm:h-5 bg-white rounded-full shadow-md transition-transform ${
                  autoSpeak ? "translate-x-7 sm:translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

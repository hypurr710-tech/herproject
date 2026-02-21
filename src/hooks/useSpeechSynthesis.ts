"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface TTSVoice {
  id: string;
  name: string;
  description: string;
}

export const OPENAI_VOICES: TTSVoice[] = [
  { id: "shimmer", name: "Shimmer", description: "Samantha 느낌 · 부드럽고 따뜻" },
  { id: "nova", name: "Nova", description: "밝고 친근한 여성 목소리" },
  { id: "alloy", name: "Alloy", description: "중성적 · 차분한 톤" },
  { id: "echo", name: "Echo", description: "따뜻하고 감성적인 남성" },
  { id: "fable", name: "Fable", description: "영국식 · 이야기하는 듯한" },
  { id: "onyx", name: "Onyx", description: "낮고 깊은 남성 목소리" },
];

export type TTSProvider = "openai" | "elevenlabs";

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  voiceName: string;
  setVoiceName: (voice: string) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  availableVoices: TTSVoice[];
  isSupported: boolean;
  ttsProvider: TTSProvider;
  setTtsProvider: (provider: TTSProvider) => void;
  elevenlabsVoiceId: string;
  setElevenlabsVoiceId: (id: string) => void;
  elevenlabsVoices: TTSVoice[];
  loadElevenlabsVoices: () => Promise<void>;
}

function browserFallbackSpeak(
  text: string,
  setIsSpeaking: (v: boolean) => void
) {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.1;
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.name.includes("Samantha") || v.name.includes("Google US English")
    ) || voices.find((v) => v.lang.startsWith("en"));
    if (englishVoice) utterance.voice = englishVoice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  } else {
    setIsSpeaking(false);
  }
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceName, setVoiceName] = useState("shimmer");
  const [speed, setSpeed] = useState(0.9);
  const [ttsProvider, setTtsProvider] = useState<TTSProvider>("openai");
  const [elevenlabsVoiceId, setElevenlabsVoiceId] = useState("");
  const [elevenlabsVoices, setElevenlabsVoices] = useState<TTSVoice[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load saved TTS settings from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("her_settings");
      if (saved) {
        const settings = JSON.parse(saved);
        if (settings.ttsProvider) setTtsProvider(settings.ttsProvider);
        if (settings.elevenlabsVoiceId) setElevenlabsVoiceId(settings.elevenlabsVoiceId);
        if (settings.selectedVoice) setVoiceName(settings.selectedVoice);
        if (settings.voiceSpeed) setSpeed(settings.voiceSpeed);
      }
    } catch {
      // ignore
    }
  }, []);

  const loadElevenlabsVoices = useCallback(async () => {
    try {
      const response = await fetch("/api/tts-elevenlabs");
      if (response.ok) {
        const data = await response.json();
        setElevenlabsVoices(data.voices || []);
      }
    } catch {
      // ElevenLabs not configured
    }
  }, []);

  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      stop();

      const abortController = new AbortController();
      abortRef.current = abortController;

      try {
        setIsSpeaking(true);

        let response: Response;

        if (ttsProvider === "elevenlabs" && elevenlabsVoiceId) {
          response = await fetch("/api/tts-elevenlabs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text,
              voiceId: elevenlabsVoiceId,
            }),
            signal: abortController.signal,
          });
        } else {
          response = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, voice: voiceName, speed }),
            signal: abortController.signal,
          });
        }

        if (!response.ok) {
          browserFallbackSpeak(text, setIsSpeaking);
          return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
          audioRef.current = null;
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
          audioRef.current = null;
        };

        await audio.play();
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setIsSpeaking(false);
        browserFallbackSpeak(text, setIsSpeaking);
      }
    },
    [voiceName, speed, stop, ttsProvider, elevenlabsVoiceId]
  );

  return {
    speak,
    stop,
    isSpeaking,
    voiceName,
    setVoiceName,
    speed,
    setSpeed,
    availableVoices: OPENAI_VOICES,
    isSupported: true,
    ttsProvider,
    setTtsProvider,
    elevenlabsVoiceId,
    setElevenlabsVoiceId,
    elevenlabsVoices,
    loadElevenlabsVoices,
  };
}

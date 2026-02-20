"use client";

import { useState, useRef, useCallback } from "react";

export interface TTSVoice {
  id: string;
  name: string;
  description: string;
}

export const OPENAI_VOICES: TTSVoice[] = [
  { id: "nova", name: "Nova", description: "Warm & friendly" },
  { id: "shimmer", name: "Shimmer", description: "Soft & gentle" },
  { id: "alloy", name: "Alloy", description: "Neutral & balanced" },
  { id: "echo", name: "Echo", description: "Warm & expressive" },
  { id: "fable", name: "Fable", description: "British & storytelling" },
  { id: "onyx", name: "Onyx", description: "Deep & authoritative" },
];

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
  const [voiceName, setVoiceName] = useState("nova");
  const [speed, setSpeed] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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

        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice: voiceName, speed }),
          signal: abortController.signal,
        });

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
    [voiceName, speed, stop]
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
  };
}

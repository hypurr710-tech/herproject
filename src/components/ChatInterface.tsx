"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Message, ConversationTopic } from "@/types";
import { TOPICS, DIFFICULTY_PROMPTS } from "@/lib/systemPrompts";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import MessageBubble from "./MessageBubble";
import TopicSelector from "./TopicSelector";
import SettingsModal from "./SettingsModal";
import WaveAnimation from "./WaveAnimation";
import OrbAnimation from "./OrbAnimation";

type ViewMode = "orb" | "chat";

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<ConversationTopic>(
    TOPICS[0]
  );
  const [isTopicOpen, setIsTopicOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >("intermediate");
  const [textInput, setTextInput] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("orb");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: sttSupported,
    error: sttError,
  } = useSpeechRecognition();

  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    pitch,
    setPitch,
  } = useSpeechSynthesis();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Switch to chat view when first message is sent
  useEffect(() => {
    if (messages.length > 0 && viewMode === "orb") {
      setViewMode("chat");
    }
  }, [messages.length, viewMode]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const systemPrompt =
          selectedTopic.systemPrompt + DIFFICULTY_PROMPTS[difficulty];

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            systemPrompt,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to get response");
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        if (autoSpeak) {
          speak(data.message);
        }
      } catch (error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            error instanceof Error
              ? `Sorry, there was an error: ${error.message}`
              : "Sorry, something went wrong. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, selectedTopic, difficulty, autoSpeak, speak]
  );

  const handleVoiceSubmit = useCallback(() => {
    if (transcript.trim()) {
      sendMessage(transcript);
      resetTranscript();
    }
    stopListening();
  }, [transcript, sendMessage, resetTranscript, stopListening]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      sendMessage(textInput);
      setTextInput("");
    }
  };

  const handleBackToOrb = () => {
    setMessages([]);
    stopSpeaking();
    setViewMode("orb");
  };

  const currentTranscript =
    transcript + (interimTranscript ? " " + interimTranscript : "");

  // Determine orb state
  const getOrbState = (): "idle" | "listening" | "speaking" | "thinking" => {
    if (isListening) return "listening";
    if (isSpeaking) return "speaking";
    if (isLoading) return "thinking";
    return "idle";
  };

  return (
    <div className="flex flex-col h-dvh bg-[#08080f] text-white overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(167, 139, 250, 0.06) 0%, rgba(10, 6, 6, 0) 70%)",
        }}
      />

      {/* Header */}
      <header className="relative z-40 flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#08080f]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {viewMode === "chat" && (
            <button
              onClick={handleBackToOrb}
              className="p-2 -ml-1 rounded-full hover:bg-white/10 transition-colors"
              title="Back to main"
            >
              <svg
                className="w-5 h-5 text-white/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/20"
            style={{ background: "linear-gradient(135deg, #a78bfa, #f472b6, #60a5fa)" }}>
            <div className="w-3 h-3 rounded-full bg-white/80 shadow-sm" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">Her</h1>
            <p className="text-[11px] text-white/30">
              {viewMode === "orb"
                ? "Your English speaking partner"
                : selectedTopic.label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TopicSelector
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            isOpen={isTopicOpen}
            onToggle={() => setIsTopicOpen(!isTopicOpen)}
          />

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Settings"
          >
            <svg
              className="w-5 h-5 text-white/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* ORB VIEW */}
      {viewMode === "orb" && (
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* Orb */}
          <div className="relative flex items-center justify-center">
            <OrbAnimation state={getOrbState()} size={140} />

            {/* State label */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
              {isListening && (
                <div className="flex items-center gap-2 animate-fadeIn">
                  <WaveAnimation isActive={true} />
                  <span className="text-sm text-purple-400 font-medium tracking-wide uppercase">
                    Listening
                  </span>
                </div>
              )}
              {isSpeaking && (
                <span className="text-sm text-purple-400/80 font-medium tracking-wide uppercase animate-fadeIn">
                  Speaking
                </span>
              )}
              {isLoading && (
                <span className="text-sm text-white/40 font-medium tracking-wide uppercase animate-fadeIn">
                  Thinking...
                </span>
              )}
            </div>
          </div>

          {/* Subtitle text */}
          <div className="mt-16 text-center px-8">
            <p className="text-white/25 text-sm leading-relaxed">
              Tap the mic to start speaking
            </p>
          </div>

          {/* Live transcript overlay */}
          {isListening && currentTranscript && (
            <div className="absolute bottom-28 left-0 right-0 px-6 animate-fadeIn">
              <div className="max-w-md mx-auto bg-white/5 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/10">
                <p className="text-sm text-white/80 text-center">
                  {currentTranscript}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CHAT VIEW */}
      {viewMode === "chat" && (
        <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onSpeak={message.role === "assistant" ? speak : undefined}
              isSpeaking={isSpeaking}
            />
          ))}

          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-white/10 rounded-[20px] rounded-bl-[4px] px-5 py-4 shadow-lg">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
                  <div
                    className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Voice Transcript Overlay (chat mode) */}
      {viewMode === "chat" && isListening && (
        <div className="px-4 py-3 bg-purple-500/10 border-t border-purple-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <WaveAnimation isActive={isListening} />
            <div className="flex-1">
              <p className="text-sm text-white/90">
                {currentTranscript || (
                  <span className="text-white/40">Listening...</span>
                )}
              </p>
            </div>
            <button
              onClick={handleVoiceSubmit}
              className="px-4 py-1.5 bg-purple-500 text-white text-sm rounded-full hover:bg-purple-600 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="relative z-30 px-4 py-4 border-t border-white/5 bg-[#08080f]/80 backdrop-blur-xl">
        {sttError && (
          <p className="text-xs text-red-400 mb-2 text-center">{sttError}</p>
        )}
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          {/* Voice Button */}
          {sttSupported && (
            <button
              onClick={isListening ? handleVoiceSubmit : startListening}
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isListening
                  ? "bg-purple-500 shadow-purple-500/40 scale-110"
                  : "bg-white/10 hover:bg-white/20 hover:scale-105"
              }`}
              title={isListening ? "Stop & Send" : "Start speaking"}
            >
              <svg
                className="w-5 h-5 text-white"
                fill={isListening ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z"
                />
              </svg>
            </button>
          )}

          {/* Text Input */}
          <form onSubmit={handleTextSubmit} className="flex-1 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-white/10 text-white placeholder:text-white/30 rounded-full px-5 py-3 text-sm border border-white/10 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.12] transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!textInput.trim() || isLoading}
              className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center hover:bg-purple-600 transition-all disabled:opacity-30 disabled:hover:bg-purple-500 shadow-lg shadow-purple-500/20"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19V5m0 0l-7 7m7-7l7 7"
                />
              </svg>
            </button>
          </form>

          {/* Stop Speaking Button */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
              title="Stop speaking"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        voices={voices}
        selectedVoice={selectedVoice}
        onVoiceChange={setSelectedVoice}
        rate={rate}
        onRateChange={setRate}
        pitch={pitch}
        onPitchChange={setPitch}
        autoSpeak={autoSpeak}
        onAutoSpeakChange={setAutoSpeak}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
      />
    </div>
  );
}

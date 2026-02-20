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

  const currentTranscript =
    transcript + (interimTranscript ? " " + interimTranscript : "");

  const getOrbState = (): "idle" | "listening" | "speaking" | "thinking" => {
    if (isListening) return "listening";
    if (isSpeaking) return "speaking";
    if (isLoading) return "thinking";
    return "idle";
  };

  return (
    <div className="flex flex-col h-dvh bg-[#E8625B] text-white overflow-hidden">
      {/* Header */}
      <header className="relative z-40 flex items-center justify-between px-5 py-3.5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-light tracking-[6px] uppercase text-white/90">
            Her
          </h1>
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
              className="w-5 h-5 text-white/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Single page layout */}
      <div className="flex-1 flex flex-col items-center overflow-hidden pt-[2vh]">
        {/* Thread Animation */}
        <div className="flex-shrink-0 relative flex items-center justify-center">
          <OrbAnimation state={getOrbState()} />

          {/* State label */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
            {isListening && (
              <div className="flex items-center gap-2 animate-fadeIn">
                <WaveAnimation isActive={true} />
                <span className="text-xs text-white/60 font-light tracking-[3px] uppercase">
                  Listening
                </span>
              </div>
            )}
            {isSpeaking && (
              <span className="text-xs text-white/60 font-light tracking-[3px] uppercase animate-fadeIn">
                Speaking
              </span>
            )}
            {isLoading && (
              <span className="text-xs text-white/50 font-light tracking-[3px] uppercase animate-fadeIn">
                Thinking...
              </span>
            )}
          </div>
        </div>

        {/* Conversation area */}
        <div
          className="flex-1 w-full max-w-lg overflow-y-auto px-5 py-3 scroll-smooth"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 3%, black 92%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 3%, black 92%, transparent 100%)",
          }}
        >
          {/* Live transcript */}
          {isListening && currentTranscript && (
            <div className="w-full max-w-sm mx-auto mb-3 animate-fadeIn">
              <div className="bg-white/[0.12] backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/[0.15] text-center">
                <WaveAnimation isActive={true} />
                <span className="text-sm text-white/90 ml-2 font-light">
                  {currentTranscript}
                </span>
              </div>
            </div>
          )}

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
              <div className="bg-white/[0.08] border border-white/[0.08] rounded-[20px] rounded-bl-[4px] px-5 py-4">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" />
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Subtitle */}
        {messages.length === 0 && !isListening && (
          <p className="text-white/35 text-xs pb-2 font-light tracking-wide">
            Tap the mic to start speaking
          </p>
        )}
      </div>

      {/* Input Area */}
      <div className="relative z-30 px-4 py-4 flex-shrink-0">
        {sttError && (
          <p className="text-xs text-white/70 mb-2 text-center font-light">
            {sttError}
          </p>
        )}
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          {/* Voice Button */}
          {sttSupported && (
            <button
              onClick={isListening ? handleVoiceSubmit : startListening}
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? "bg-white/95 text-[#E8625B] shadow-[0_4px_24px_rgba(255,255,255,0.25)] scale-110"
                  : "bg-white/[0.12] hover:bg-white/20 hover:scale-105 text-white/60"
              }`}
              title={isListening ? "Stop & Send" : "Start speaking"}
            >
              <svg
                className="w-5 h-5"
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
              className="flex-1 bg-white/[0.12] text-white placeholder:text-white/35 rounded-full px-5 py-3 text-sm font-light border border-white/[0.15] focus:outline-none focus:border-white/35 focus:bg-white/[0.16] transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!textInput.trim() || isLoading}
              className="flex-shrink-0 w-12 h-12 rounded-full bg-white/90 text-[#E8625B] flex items-center justify-center hover:bg-white transition-all disabled:opacity-30 disabled:hover:bg-white/90"
            >
              <svg
                className="w-5 h-5"
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
              className="flex-shrink-0 w-12 h-12 rounded-full bg-white/[0.12] flex items-center justify-center hover:bg-white/20 transition-all"
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

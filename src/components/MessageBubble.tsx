"use client";

import { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
}

export default function MessageBubble({
  message,
  onSpeak,
  isSpeaking,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 animate-fadeIn`}
    >
      <div
        className={`max-w-[80%] ${
          isUser
            ? "bg-white/[0.18] border border-white/[0.15] text-white/95 rounded-[20px] rounded-br-[4px]"
            : "bg-white/[0.08] border border-white/[0.08] text-white/90 rounded-[20px] rounded-bl-[4px]"
        } px-5 py-3`}
      >
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-light">
          {message.content}
        </p>
        <div
          className={`flex items-center gap-2 mt-2 ${isUser ? "justify-end" : "justify-start"}`}
        >
          <span className="text-[11px] opacity-40">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {!isUser && onSpeak && (
            <button
              onClick={() => onSpeak(message.content)}
              className="opacity-40 hover:opacity-80 transition-opacity"
              title="Listen again"
            >
              {isSpeaking ? (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.8l4.9-3.5a.6.6 0 011.1.5v12.4a.6.6 0 01-1.1.5L6.5 15.2H4a1 1 0 01-1-1v-4.4a1 1 0 011-1h2.5z"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

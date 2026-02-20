"use client";

import { ConversationTopic } from "@/types";
import { TOPICS } from "@/lib/systemPrompts";

interface TopicSelectorProps {
  selectedTopic: ConversationTopic;
  onSelectTopic: (topic: ConversationTopic) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function TopicSelector({
  selectedTopic,
  onSelectTopic,
  isOpen,
  onToggle,
}: TopicSelectorProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/[0.1] hover:bg-white/[0.18] transition-all text-sm border border-white/[0.12] active:scale-95"
      >
        <span>{selectedTopic.icon}</span>
        <span className="text-white/90 font-light">{selectedTopic.label}</span>
        <svg
          className={`w-4 h-4 text-white/50 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[calc(100vw-1.5rem)] sm:w-64 max-w-[280px] bg-[#D4564E]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/[0.12] overflow-hidden z-50">
          <div className="p-2">
            {TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => {
                  onSelectTopic(topic);
                  onToggle();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 sm:py-3 rounded-xl text-left transition-all active:scale-[0.98] ${
                  selectedTopic.id === topic.id
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-lg">{topic.icon}</span>
                <div>
                  <div className="text-sm font-light">{topic.label}</div>
                  <div className="text-xs text-white/40 font-light">
                    {topic.labelKo}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

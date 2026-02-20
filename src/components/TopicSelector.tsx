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
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-sm backdrop-blur-sm border border-white/10"
      >
        <span>{selectedTopic.icon}</span>
        <span className="text-white/90">{selectedTopic.label}</span>
        <svg
          className={`w-4 h-4 text-white/60 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
        <div className="absolute top-full left-0 mt-2 w-64 bg-[#12121a]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50">
          <div className="p-2">
            {TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => {
                  onSelectTopic(topic);
                  onToggle();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  selectedTopic.id === topic.id
                    ? "bg-purple-500/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-lg">{topic.icon}</span>
                <div>
                  <div className="text-sm font-medium">{topic.label}</div>
                  <div className="text-xs text-white/40">{topic.labelKo}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

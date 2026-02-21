export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ConversationTopic {
  id: string;
  label: string;
  labelKo: string;
  icon: string;
  systemPrompt: string;
}

export interface AppSettings {
  voiceSpeed: number;
  voicePitch: number;
  selectedVoice: string;
  autoSpeak: boolean;
  showTranslation: boolean;
  difficulty: "beginner" | "intermediate" | "advanced";
  ttsProvider: "openai" | "elevenlabs";
  elevenlabsVoiceId: string;
}

export interface UserProfile {
  name: string;
  nickname: string;
  interests: string[];
  bio: string;
  preferredTopics: string[];
  personalityNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryEntry {
  id: string;
  type: "fact" | "preference" | "experience" | "opinion" | "summary";
  content: string;
  source: string; // conversation excerpt that generated this memory
  createdAt: string;
  importance: number; // 1-5 scale
}

export interface ConversationRecord {
  id: string;
  topicId: string;
  messages: Message[];
  summary: string;
  startedAt: string;
  endedAt: string;
}

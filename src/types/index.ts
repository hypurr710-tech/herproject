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
}

import { UserProfile, MemoryEntry, ConversationRecord, AppSettings } from "@/types";

const KEYS = {
  USER_PROFILE: "her_user_profile",
  MEMORIES: "her_memories",
  CONVERSATIONS: "her_conversations",
  SETTINGS: "her_settings",
} as const;

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage write failed:", e);
  }
}

// --- User Profile ---

export function getUserProfile(): UserProfile | null {
  return safeGet<UserProfile | null>(KEYS.USER_PROFILE, null);
}

export function saveUserProfile(profile: UserProfile): void {
  profile.updatedAt = new Date().toISOString();
  safeSet(KEYS.USER_PROFILE, profile);
}

export function hasUserProfile(): boolean {
  return getUserProfile() !== null;
}

// --- Memories ---

export function getMemories(): MemoryEntry[] {
  return safeGet<MemoryEntry[]>(KEYS.MEMORIES, []);
}

export function addMemories(entries: MemoryEntry[]): void {
  const current = getMemories();
  const merged = [...current, ...entries];
  // Keep max 200 memories, prioritize by importance then recency
  const sorted = merged.sort((a, b) => {
    if (b.importance !== a.importance) return b.importance - a.importance;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  safeSet(KEYS.MEMORIES, sorted.slice(0, 200));
}

export function clearMemories(): void {
  safeSet(KEYS.MEMORIES, []);
}

export function getMemoryContext(maxEntries: number = 20): string {
  const memories = getMemories().slice(0, maxEntries);
  if (memories.length === 0) return "";

  const grouped: Record<string, string[]> = {};
  for (const m of memories) {
    if (!grouped[m.type]) grouped[m.type] = [];
    grouped[m.type].push(m.content);
  }

  const sections: string[] = [];
  if (grouped.fact?.length) {
    sections.push(`Facts about the user: ${grouped.fact.join("; ")}`);
  }
  if (grouped.preference?.length) {
    sections.push(`User preferences: ${grouped.preference.join("; ")}`);
  }
  if (grouped.experience?.length) {
    sections.push(`Past experiences shared: ${grouped.experience.join("; ")}`);
  }
  if (grouped.opinion?.length) {
    sections.push(`Opinions expressed: ${grouped.opinion.join("; ")}`);
  }
  if (grouped.summary?.length) {
    sections.push(`Recent conversation summaries: ${grouped.summary.join("; ")}`);
  }

  return sections.join("\n");
}

// --- Conversations ---

export function getConversations(): ConversationRecord[] {
  return safeGet<ConversationRecord[]>(KEYS.CONVERSATIONS, []);
}

export function saveConversation(record: ConversationRecord): void {
  const conversations = getConversations();
  const existing = conversations.findIndex((c) => c.id === record.id);
  if (existing >= 0) {
    conversations[existing] = record;
  } else {
    conversations.push(record);
  }
  // Keep last 50 conversations
  const trimmed = conversations.slice(-50);
  safeSet(KEYS.CONVERSATIONS, trimmed);
}

export function getRecentConversationSummaries(count: number = 5): string[] {
  return getConversations()
    .filter((c) => c.summary)
    .slice(-count)
    .map((c) => c.summary);
}

// --- Settings ---

export function getSettings(): Partial<AppSettings> {
  return safeGet<Partial<AppSettings>>(KEYS.SETTINGS, {});
}

export function saveSettings(settings: Partial<AppSettings>): void {
  const current = getSettings();
  safeSet(KEYS.SETTINGS, { ...current, ...settings });
}

"use client";

import { useState } from "react";
import { UserProfile } from "@/types";

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
  existingProfile?: UserProfile | null;
}

const INTEREST_OPTIONS = [
  "Tech & AI", "Crypto & Web3", "Finance", "Startups",
  "Travel", "Food & Cooking", "Music", "Movies & TV",
  "Gaming", "Fitness", "Reading", "Photography",
  "Art & Design", "K-Culture", "Sports", "Fashion",
];

export default function ProfileSetup({ onComplete, existingProfile }: ProfileSetupProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(existingProfile?.name || "");
  const [nickname, setNickname] = useState(existingProfile?.nickname || "");
  const [bio, setBio] = useState(existingProfile?.bio || "");
  const [interests, setInterests] = useState<string[]>(existingProfile?.interests || []);
  const [personalityNotes, setPersonalityNotes] = useState(existingProfile?.personalityNotes || "");

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleComplete = () => {
    const profile: UserProfile = {
      name: name.trim(),
      nickname: nickname.trim(),
      interests,
      bio: bio.trim(),
      preferredTopics: [],
      personalityNotes: personalityNotes.trim(),
      createdAt: existingProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onComplete(profile);
  };

  const canProceed = () => {
    if (step === 0) return name.trim().length > 0;
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#E8625B]">
      <div className="w-full max-w-md px-6 py-8">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? "bg-white w-6" : i < step ? "bg-white/60" : "bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Step 0: Name */}
        {step === 0 && (
          <div className="animate-fadeIn text-center">
            <h2 className="text-2xl font-light text-white mb-2 tracking-wide">
              Nice to meet you
            </h2>
            <p className="text-white/50 text-sm mb-8 font-light">
              What should I call you?
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-white/[0.12] text-white text-center placeholder:text-white/30 rounded-2xl px-6 py-4 text-lg font-light border border-white/[0.15] focus:outline-none focus:border-white/35 transition-all mb-4"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && canProceed() && setStep(1)}
            />
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Nickname (optional)"
              className="w-full bg-white/[0.08] text-white text-center placeholder:text-white/25 rounded-2xl px-6 py-3 text-sm font-light border border-white/[0.1] focus:outline-none focus:border-white/25 transition-all"
              onKeyDown={(e) => e.key === "Enter" && canProceed() && setStep(1)}
            />
          </div>
        )}

        {/* Step 1: Interests */}
        {step === 1 && (
          <div className="animate-fadeIn text-center">
            <h2 className="text-2xl font-light text-white mb-2 tracking-wide">
              What are you into?
            </h2>
            <p className="text-white/50 text-sm mb-6 font-light">
              Pick a few topics you enjoy talking about
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2.5 rounded-full text-sm font-light transition-all active:scale-95 ${
                    interests.includes(interest)
                      ? "bg-white/25 text-white border border-white/30"
                      : "bg-white/[0.08] text-white/50 border border-transparent hover:bg-white/[0.12]"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Bio */}
        {step === 2 && (
          <div className="animate-fadeIn text-center">
            <h2 className="text-2xl font-light text-white mb-2 tracking-wide">
              Tell me about yourself
            </h2>
            <p className="text-white/50 text-sm mb-6 font-light">
              A brief intro so I can personalize our conversations
            </p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g., I'm a developer based in Seoul, love exploring new tech and good coffee..."
              className="w-full bg-white/[0.12] text-white placeholder:text-white/25 rounded-2xl px-5 py-4 text-sm font-light border border-white/[0.15] focus:outline-none focus:border-white/35 transition-all resize-none h-32"
              autoFocus
            />
          </div>
        )}

        {/* Step 3: Communication style */}
        {step === 3 && (
          <div className="animate-fadeIn text-center">
            <h2 className="text-2xl font-light text-white mb-2 tracking-wide">
              How should we talk?
            </h2>
            <p className="text-white/50 text-sm mb-6 font-light">
              Any preferences for our conversation style?
            </p>
            <div className="space-y-2 mb-4">
              {[
                "Be casual and fun, like a close friend",
                "Challenge me to improve my English",
                "Be patient and encouraging",
                "Correct my mistakes naturally",
              ].map((option) => (
                <button
                  key={option}
                  onClick={() =>
                    setPersonalityNotes((prev) =>
                      prev.includes(option)
                        ? prev.replace(option + ". ", "").replace(option, "")
                        : (prev ? prev + ". " : "") + option
                    )
                  }
                  className={`w-full px-4 py-3 rounded-xl text-sm font-light text-left transition-all active:scale-[0.98] ${
                    personalityNotes.includes(option)
                      ? "bg-white/20 text-white border border-white/25"
                      : "bg-white/[0.08] text-white/60 border border-transparent hover:bg-white/[0.12]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <textarea
              value={personalityNotes}
              onChange={(e) => setPersonalityNotes(e.target.value)}
              placeholder="Or write your own preferences..."
              className="w-full bg-white/[0.08] text-white placeholder:text-white/25 rounded-2xl px-4 py-3 text-xs font-light border border-white/[0.1] focus:outline-none focus:border-white/25 transition-all resize-none h-16"
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 rounded-full text-sm font-light text-white/50 hover:text-white/80 transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="px-8 py-3 rounded-full bg-white/90 text-[#E8625B] text-sm font-medium hover:bg-white transition-all active:scale-95 disabled:opacity-30"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-8 py-3 rounded-full bg-white/90 text-[#E8625B] text-sm font-medium hover:bg-white transition-all active:scale-95"
            >
              Start Chatting
            </button>
          )}
        </div>

        {/* Skip option */}
        {step === 0 && !existingProfile && (
          <button
            onClick={() => {
              const quickProfile: UserProfile = {
                name: "",
                nickname: "",
                interests: [],
                bio: "",
                preferredTopics: [],
                personalityNotes: "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              onComplete(quickProfile);
            }}
            className="w-full mt-4 text-center text-white/30 text-xs font-light hover:text-white/50 transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}

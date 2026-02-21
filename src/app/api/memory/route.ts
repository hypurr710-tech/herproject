import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { messages, userProfile } = await request.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "your_openai_api_key_here") {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const userName = userProfile?.name || "the user";

    const extractionPrompt = `You are a memory extraction assistant. Analyze the following conversation and extract important information about ${userName} that should be remembered for future conversations.

Extract the following types of information:
1. **facts**: Personal facts (job, location, family, age, etc.)
2. **preferences**: Likes, dislikes, preferences (food, music, hobbies, etc.)
3. **experiences**: Past experiences they shared (trips, events, achievements, etc.)
4. **opinions**: Strong opinions or viewpoints expressed
5. **summary**: A brief 1-2 sentence summary of what this conversation was about

Return a JSON object with this exact structure:
{
  "memories": [
    { "type": "fact"|"preference"|"experience"|"opinion", "content": "concise description", "importance": 1-5 }
  ],
  "summary": "Brief conversation summary"
}

Rules:
- Only extract genuinely meaningful information, not trivial details
- importance: 5=critical personal info, 3=useful context, 1=minor detail
- Keep each memory content concise (1 short sentence)
- If no meaningful information found, return empty memories array
- Return ONLY valid JSON, no markdown formatting`;

    const conversationText = messages
      .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join("\n");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
          { role: "system", content: extractionPrompt },
          { role: "user", content: conversationText },
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: `OpenAI API error: ${response.status} ${errorData?.error?.message || ""}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { memories: [], summary: "" };
    }

    return NextResponse.json({
      memories: parsed.memories || [],
      summary: parsed.summary || "",
    });
  } catch (error) {
    console.error("Memory API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

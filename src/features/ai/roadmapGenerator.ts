import type { AIRoadmapGenerationInput, AIRoadmapResult } from '@/types';
import {
  buildRoadmapPrompt,
  parseAndValidateAIRoadmap,
} from '@/features/ai/promptEngine';
import { generateMockRoadmap } from '@/features/ai/mockRoadmapData';

interface GeminiCandidatePart {
  text?: string;
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiCandidatePart[];
  };
}

interface GeminiGenerateContentResponse {
  candidates?: GeminiCandidate[];
}

function getGeminiApiKey(): string | null {
  const key = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim();
  return key && key.length > 0 ? key : null;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function isLiveAIConfigured(): boolean {
  return getGeminiApiKey() !== null;
}

export async function generateRoadmapWithAI(
  input: AIRoadmapGenerationInput
): Promise<{ result: AIRoadmapResult; source: 'GEMINI' | 'MOCK' }> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    await delay(1500);
    return {
      result: generateMockRoadmap(input),
      source: 'MOCK',
    };
  }

  try {
    const prompt = buildRoadmapPrompt(input);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      await delay(1500);
      return {
        result: generateMockRoadmap(input),
        source: 'MOCK',
      };
    }

    const data = (await response.json()) as GeminiGenerateContentResponse;
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      await delay(1500);
      return {
        result: generateMockRoadmap(input),
        source: 'MOCK',
      };
    }

    const validated = parseAndValidateAIRoadmap(rawText);
    return {
      result: validated,
      source: 'GEMINI',
    };
  } catch {
    await delay(1500);
    return {
      result: generateMockRoadmap(input),
      source: 'MOCK',
    };
  }
}

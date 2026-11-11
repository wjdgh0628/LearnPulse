import type { AIRoadmapGenerationInput, AIRoadmapResult } from '@/types';
import {
  buildRoadmapPrompt,
  parseAndValidateAIRoadmap,
} from '@/features/ai/promptEngine';

const AI_REQUEST_TIMEOUT_MS = 20000;

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

function getAIProxyUrl(): string | null {
  const proxyUrl = (
    import.meta.env.VITE_AI_PROXY_URL as string | undefined
  )?.trim();
  return proxyUrl && proxyUrl.length > 0 ? proxyUrl : null;
}

function getGeminiApiKey(): string | null {
  const key = (
    import.meta.env.VITE_GEMINI_API_KEY as string | undefined
  )?.trim();
  return key && key.length > 0 ? key : null;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * 대용량 정적 커리큘럼 데이터(mockRoadmapData)를 초기 번들에서 분리하여
 * 실제 폴백 또는 데모 생성이 필요한 시점에만 동적으로 로드(Code Splitting)합니다.
 */
async function loadAndGenerateMockRoadmap(
  input: AIRoadmapGenerationInput
): Promise<AIRoadmapResult> {
  const { generateMockRoadmap } = await import('@/features/ai/mockRoadmapData');
  return generateMockRoadmap(input);
}

export function isLiveAIConfigured(): boolean {
  return getAIProxyUrl() !== null || getGeminiApiKey() !== null;
}

export async function generateRoadmapWithAI(
  input: AIRoadmapGenerationInput
): Promise<{ result: AIRoadmapResult; source: 'GEMINI' | 'MOCK' }> {
  const proxyUrl = getAIProxyUrl();
  const apiKey = getGeminiApiKey();

  if (!proxyUrl && !apiKey) {
    await delay(800);
    const mockResult = await loadAndGenerateMockRoadmap(input);
    return {
      result: mockResult,
      source: 'MOCK',
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  try {
    const prompt = buildRoadmapPrompt(input);

    // 보안 권장: VITE_AI_PROXY_URL이 설정된 경우 프론트엔드에 API 키를 노출하지 않고 서버리스 프록시로 호출
    const endpoint = proxyUrl
      ? proxyUrl
      : `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
          apiKey ?? ''
        )}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
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
      console.warn(
        `[LearnPulse AI] API returned HTTP ${response.status}. Falling back to built-in curriculum engine.`
      );
      const mockResult = await loadAndGenerateMockRoadmap(input);
      return {
        result: mockResult,
        source: 'MOCK',
      };
    }

    const data = (await response.json()) as GeminiGenerateContentResponse;
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.warn(
        '[LearnPulse AI] Empty candidate text. Falling back to built-in curriculum engine.'
      );
      const mockResult = await loadAndGenerateMockRoadmap(input);
      return {
        result: mockResult,
        source: 'MOCK',
      };
    }

    const validated = parseAndValidateAIRoadmap(rawText);
    return {
      result: validated,
      source: 'GEMINI',
    };
  } catch (err) {
    console.warn(
      '[LearnPulse AI] Generation failed or timed out, using fallback curriculum:',
      err
    );
    const mockResult = await loadAndGenerateMockRoadmap(input);
    return {
      result: mockResult,
      source: 'MOCK',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

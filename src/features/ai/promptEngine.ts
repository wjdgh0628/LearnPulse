import {
  AIRoadmapSchema,
  type AIRoadmapGenerationInput,
  type AIRoadmapResult,
  type UserLevel,
} from '@/types';

export const SYSTEM_PROMPT = `당신은 최고의 커리큘럼 설계자이자 친절한 학습 코치입니다.
사용자가 입력한 [학습 주제], [현재 수준(BEGINNER/INTERMEDIATE/ADVANCED)], [목표 기간]을 분석하여, 막막함 없이 당장 오늘부터 하나씩 따라 할 수 있도록 아주 세분화된 단계별 학습 로드맵을 구축하십시오.
너무 큰 덩어리로 뭉뚱그리지 말고, 사용자가 이해하고 공부하기 쉽도록 각 학습 항목마다 '쉬운 개념 설명(description)', '단계별 세부 공부 순서(subTasks 3~4개)', '핵심 키워드(keywords)', '예상 소요 시간(estimatedTime)'을 반드시 포함하십시오.
반드시 지정된 JSON 스키마 규격으로만 응답해야 하며, 부가적인 마크다운 서식이나 자연어 인삿말은 제외하십시오.`;

const LEVEL_DESCRIPTIONS: Record<UserLevel, string> = {
  BEGINNER:
    '입문 (해당 분야를 처음 접하며 기초 용어와 핵심 개념부터 차근차근 필요한 단계)',
  INTERMEDIATE:
    '중급 (기본 문법과 개념은 알고 있으나 실전 적용 및 응용 학습이 필요한 단계)',
  ADVANCED:
    '심화 (실무 아키텍처 설계, 성능 최적화, 고난도 문제 해결이 목표인 단계)',
};

export function buildRoadmapPrompt(input: AIRoadmapGenerationInput): string {
  const levelGuide = LEVEL_DESCRIPTIONS[input.level];

  return `${SYSTEM_PROMPT}

[입력 정보]
- 학습 주제: ${input.topic}
- 현재 수준: ${input.level} (${levelGuide})
- 목표 학습 기간: ${input.targetDuration}

[응답 JSON 스키마 규격]
{
  "title": "로드맵 전체 제목 (문자열, 최소 2자)",
  "topic": "핵심 주제명 (문자열)",
  "summary": "로드맵 전체 요약 및 학습 전략 설명 (문자열, 최소 10자)",
  "targetDuration": "${input.targetDuration}",
  "chapters": [
    {
      "title": "챕터 제목 (예: 1단계: ...)",
      "description": "해당 챕터에서 달성할 핵심 목표 및 학습 가이드",
      "items": [
        {
          "title": "세분화된 단일 학습 목표",
          "description": "이 항목을 왜 배우는지와 핵심 개념에 대한 눈높이 설명 (1~2문장)",
          "estimatedTime": "예상 소요 시간 (예: 45분, 1시간)",
          "keywords": ["핵심키워드1", "핵심키워드2", "핵심키워드3"],
          "subTasks": [
            "Step 1 (개념 이해): 구체적으로 무엇을 읽고 이해해야 하는지",
            "Step 2 (직접 실습): 어떤 예제나 문제를 직접 따라 해봐야 하는지",
            "Step 3 (셀프 점검): 공부가 끝난 뒤 스스로 설명하거나 확인해 볼 체크 포인트"
          ],
          "referenceLink": "공식 문서 또는 신뢰할 수 있는 학습 레퍼런스 URL (선택)"
        }
      ]
    }
  ]
}

조건:
1. chapters는 4개에서 6개 사이로 구성하십시오.
2. 각 chapter의 items는 3개에서 6개 사이로 잘게 쪼개어 구성하십시오.
3. 각 item의 subTasks는 반드시 3개 이상의 구체적인 행동 순서(Step 1 -> Step 2 -> Step 3)로 작성하십시오.
4. 오직 순수 JSON 객체 문자열만 출력하십시오.`;
}

export function extractJsonString(rawText: string): string {
  const trimmed = rawText.trim();

  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

export function parseAndValidateAIRoadmap(rawText: string): AIRoadmapResult {
  const cleanJson = extractJsonString(rawText);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanJson);
  } catch (err) {
    throw new Error(
      `[AI Roadmap Parser] Invalid JSON format returned by AI: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }

  const validation = AIRoadmapSchema.safeParse(parsed);
  if (!validation.success) {
    throw new Error(
      `[AI Roadmap Schema] Validation failed: ${validation.error.message}`
    );
  }

  return validation.data;
}

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Button, Input, Card } from '@/components/common';
import { LevelSelector } from '@/components/roadmap-creator/LevelSelector';
import { DurationPicker } from '@/components/roadmap-creator/DurationPicker';
import { CreatorPreview } from '@/components/roadmap-creator/CreatorPreview';
import { generateRoadmapWithAI } from '@/features/ai/roadmapGenerator';
import type {
  AIRoadmapResult,
  CreateRoadmapPayload,
  PendingQuickTopicPrompt,
  UserLevel,
} from '@/types';

export interface TopicFormProps {
  onSaveRoadmap: (payload: CreateRoadmapPayload) => Promise<void>;
  pendingQuickTopic?: PendingQuickTopicPrompt | null;
  onClearQuickTopic?: () => void;
}

const RECOMMENDED_TOPICS: string[] = [
  'Python 기초 4주 완성',
  'React + TypeScript 실전',
  'SQL 데이터 분석 & 쿼리 튜닝',
  '토익 850 단기 달성',
  '머신러닝 & LLM 서비스 개발',
  'CS 전공 & 코딩테스트 핵심',
];

export const TopicForm: React.FC<TopicFormProps> = ({
  onSaveRoadmap,
  pendingQuickTopic,
  onClearQuickTopic,
}) => {
  const [topic, setTopic] = useState<string>('');
  const [level, setLevel] = useState<UserLevel>('BEGINNER');
  const [targetDuration, setTargetDuration] = useState<string>('4주 정규 과정');
  const [topicError, setTopicError] = useState<string>('');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [generatedResult, setGeneratedResult] =
    useState<AIRoadmapResult | null>(null);
  const [generationSource, setGenerationSource] = useState<
    'GEMINI' | 'MOCK' | null
  >(null);

  const runGeneration = useCallback(
    async (
      targetTopic: string,
      targetLevel: UserLevel,
      duration: string
    ) => {
      const trimmed = targetTopic.trim();
      if (trimmed.length < 2) {
        setTopicError(
          '학습 주제를 2글자 이상 입력해 주세요. (예: Python, React, 토익, SQL)'
        );
        return;
      }

      setTopicError('');
      setIsGenerating(true);

      try {
        const { result, source } = await generateRoadmapWithAI({
          topic: trimmed,
          level: targetLevel,
          targetDuration: duration,
        });
        setGeneratedResult(result);
        setGenerationSource(source);
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  // 대시보드 원클릭 단축 칩 클릭 시 즉시 AI 로드맵 자동 생성 실행
  useEffect(() => {
    if (!pendingQuickTopic) return;
    setTopic(pendingQuickTopic.topic);
    setLevel(pendingQuickTopic.level);
    setTargetDuration(pendingQuickTopic.targetDuration);
    void runGeneration(
      pendingQuickTopic.topic,
      pendingQuickTopic.level,
      pendingQuickTopic.targetDuration
    );
    if (onClearQuickTopic) {
      onClearQuickTopic();
    }
  }, [pendingQuickTopic, onClearQuickTopic, runGeneration]);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    await runGeneration(topic, level, targetDuration);
  };

  const handleSave = async () => {
    if (!generatedResult) return;
    setIsSaving(true);
    try {
      await onSaveRoadmap({
        title: generatedResult.title,
        topic: generatedResult.topic,
        level,
        targetDuration: generatedResult.targetDuration,
        summary: generatedResult.summary,
        chapters: generatedResult.chapters,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <form onSubmit={(e) => void handleGenerate(e)} className="space-y-6">
          <div className="space-y-3">
            <Input
              label="어떤 주제를 학습하고 싶으신가요?"
              placeholder="예: Python 데이터 분석, React 실전, 토익 850, SQL 쿼리 튜닝"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (topicError) setTopicError('');
              }}
              error={topicError}
              disabled={isGenerating}
              leftAddon={<Search className="h-4 w-4" />}
              helperText="배우고 싶은 기술, 자격증, 외국어 또는 직무 주제를 자유롭게 입력하세요."
            />

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                인기 추천 태그:
              </span>
              {RECOMMENDED_TOPICS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  disabled={isGenerating}
                  onClick={() => {
                    setTopic(tag);
                    setTopicError('');
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-brand-600"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <LevelSelector
            value={level}
            onChange={setLevel}
            disabled={isGenerating}
          />

          <DurationPicker
            value={targetDuration}
            onChange={setTargetDuration}
            disabled={isGenerating}
          />

          <div className="flex items-center justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isGenerating}
              leftIcon={<Sparkles className="h-5 w-5" />}
            >
              {isGenerating
                ? 'AI 커리큘럼 설계 중...'
                : 'AI 맞춤형 로드맵 생성하기'}
            </Button>
          </div>
        </form>
      </Card>

      <CreatorPreview
        isGenerating={isGenerating}
        result={generatedResult}
        level={level}
        source={generationSource}
        isSaving={isSaving}
        onSaveToLibrary={() => void handleSave()}
        onRegenerate={() => void handleGenerate()}
      />
    </div>
  );
};

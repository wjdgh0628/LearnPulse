import React, { useState } from 'react';
import {
  Sparkles,
  BookmarkPlus,
  RotateCcw,
  CheckSquare,
  BookOpen,
  Layers,
  Clock,
  Timer,
  Tag,
  BookOpenCheck,
} from 'lucide-react';
import { Button, Badge, Card } from '@/components/common';
import { StudyGuideView } from '@/components/roadmap-view/StudyGuideView';
import type { AIRoadmapResult, RoadmapItem, UserLevel } from '@/types';

export interface CreatorPreviewProps {
  isGenerating: boolean;
  result: AIRoadmapResult | null;
  level: UserLevel;
  source: 'GEMINI' | 'MOCK' | null;
  isSaving?: boolean;
  onSaveToLibrary: () => void;
  onRegenerate: () => void;
}

const LEVEL_LABELS: Record<UserLevel, string> = {
  BEGINNER: '입문 (Beginner)',
  INTERMEDIATE: '중급 (Intermediate)',
  ADVANCED: '심화 (Advanced)',
};

export const CreatorPreview: React.FC<CreatorPreviewProps> = ({
  isGenerating,
  result,
  level,
  source,
  isSaving = false,
  onSaveToLibrary,
  onRegenerate,
}) => {
  const [previewStudyTarget, setPreviewStudyTarget] = useState<{
    chapterTitle: string;
    item: RoadmapItem;
    keyword?: string;
  } | null>(null);

  if (isGenerating) {
    return (
      <Card padding="lg" className="space-y-6" aria-busy="true" aria-live="polite">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              AI가 세부 학습 가이드와 단계별 커리큘럼을 설계하고 있습니다...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              주제 분석 · 개념 쪼개기 · Step 1~3 마이크로 실습 가이드 생성 중
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4].map((skeletonIdx) => (
            <div
              key={skeletonIdx}
              className="animate-pulse space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40"
            >
              <div className="h-5 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3.5 w-2/3 rounded bg-slate-200/80 dark:bg-slate-700/70" />
              <div className="space-y-2 pt-2">
                <div className="h-3 w-full rounded bg-slate-200/60 dark:bg-slate-800" />
                <div className="h-3 w-5/6 rounded bg-slate-200/60 dark:bg-slate-800" />
                <div className="h-3 w-4/6 rounded bg-slate-200/60 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!result) {
    return null;
  }

  if (previewStudyTarget) {
    return (
      <StudyGuideView
        roadmapTitle={result.title}
        roadmapTopic={result.topic}
        chapterTitle={previewStudyTarget.chapterTitle}
        item={previewStudyTarget.item}
        highlightedKeyword={previewStudyTarget.keyword}
        onBack={() => setPreviewStudyTarget(null)}
      />
    );
  }

  const totalItems = result.chapters.reduce((sum, ch) => sum + ch.items.length, 0);

  return (
    <Card padding="lg" className="space-y-6 border-brand-200 dark:border-brand-900/60">
      {/* Header Summary */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-start">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand">{LEVEL_LABELS[level]}</Badge>
            <Badge variant="default">
              <Clock className="mr-1 h-3 w-3" />
              {result.targetDuration}
            </Badge>
            <Badge variant="outline">
              <Layers className="mr-1 h-3 w-3" />
              {result.chapters.length}개 챕터 · {totalItems}개 세분화 학습 항목
            </Badge>
            {source && (
              <Badge variant={source === 'GEMINI' ? 'success' : 'warning'}>
                {source === 'GEMINI' ? 'Gemini AI 생성' : 'Smart 커리큘럼 엔진'}
              </Badge>
            )}
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {result.title}
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {result.summary}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={onRegenerate}
          >
            다시 생성
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={isSaving}
            leftIcon={<BookmarkPlus className="h-4 w-4" />}
            onClick={onSaveToLibrary}
          >
            내 보관함에 저장
          </Button>
        </div>
      </div>

      {/* Chapters & Granular Checklist Items */}
      <div className="space-y-5">
        {result.chapters.map((chapter, chapterIndex) => (
          <div
            key={`${chapter.title}-${chapterIndex}`}
            className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {chapter.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {chapter.description}
                </p>
              </div>
              <Badge variant="outline">{chapter.items.length}개 세부 주제</Badge>
            </div>

            <ul className="mt-4 space-y-3">
              {chapter.items.map((item, itemIndex) => {
                const tempRoadmapItem: RoadmapItem = {
                  id: `preview_${chapterIndex}_${itemIndex}`,
                  chapterId: `preview_ch_${chapterIndex}`,
                  roadmapId: 'preview_roadmap',
                  orderIndex: itemIndex + 1,
                  title: item.title,
                  description: item.description,
                  subTasks: item.subTasks,
                  keywords: item.keywords,
                  estimatedTime: item.estimatedTime,
                  referenceLink: item.referenceLink,
                  status: 'TODO',
                };

                return (
                  <li
                    key={`${item.title}-${itemIndex}`}
                    className="space-y-2.5 rounded-xl bg-white p-4 text-sm shadow-xs ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewStudyTarget({
                                  chapterTitle: chapter.title,
                                  item: tempRoadmapItem,
                                })
                              }
                              className="text-left font-semibold text-slate-900 hover:text-brand-600 dark:text-slate-100 dark:hover:text-brand-400"
                            >
                              {item.title}
                            </button>
                            {item.estimatedTime && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                <Timer className="h-3 w-3 text-brand-500" />
                                {item.estimatedTime}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setPreviewStudyTarget({
                            chapterTitle: chapter.title,
                            item: tempRoadmapItem,
                          })
                        }
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-300 dark:hover:bg-brand-900/60"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>학습 가이드 보고서 보기</span>
                      </button>
                    </div>

                    {/* Keywords */}
                    {item.keywords && item.keywords.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pl-6">
                        <Tag className="h-3 w-3 text-slate-400" />
                        {item.keywords.map((kw) => (
                          <button
                            key={kw}
                            type="button"
                            onClick={() =>
                              setPreviewStudyTarget({
                                chapterTitle: chapter.title,
                                item: tempRoadmapItem,
                                keyword: kw,
                              })
                            }
                            className="rounded-md bg-brand-50/70 px-2 py-0.5 text-[11px] font-medium text-brand-700 hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-300"
                          >
                            #{kw}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Step-by-Step SubTasks */}
                    {item.subTasks && item.subTasks.length > 0 && (
                      <div className="ml-6 rounded-lg border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                        <p className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          <BookOpenCheck className="h-3.5 w-3.5 text-brand-500" />
                          세부 공부 순서 (Step-by-Step)
                        </p>
                        <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                          {item.subTasks.map((sub, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-2">
                              <span className="mt-0.5 font-semibold text-brand-600 dark:text-brand-400">
                                •
                              </span>
                              <span>{sub}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-xl bg-brand-50/80 px-4 py-3 sm:flex-row sm:items-center dark:bg-brand-950/40">
        <p className="text-xs font-medium text-brand-800 dark:text-brand-200">
          내 보관함에 저장하면 각 항목의 세부 단계(Step 1~3)를 하나씩 체크하며 나만의 요약 메모를 기록할 수 있습니다.
        </p>
        <Button
          variant="primary"
          size="sm"
          isLoading={isSaving}
          leftIcon={<BookmarkPlus className="h-4 w-4" />}
          onClick={onSaveToLibrary}
        >
          내 보관함에 저장하기
        </Button>
      </div>
    </Card>
  );
};

import React, { useState } from 'react';
import {
  Award,
  Lightbulb,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ListTodo,
} from 'lucide-react';
import { Badge, Card, ProgressBar } from '@/components/common';
import { calculateRoadmapStats } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import type {
  ItemStatus,
  Roadmap,
  RoadmapItem,
  UserLevel,
} from '@/types';

export interface StatsOverviewProps {
  roadmaps: Roadmap[];
  onTriggerQuickTopic: (
    topic: string,
    level?: UserLevel,
    targetDuration?: string
  ) => void;
  onUpdateItemStatus: (itemId: string, nextStatus: ItemStatus) => void;
  onOpenStudyGuideFromDashboard: (roadmapId: string, itemId: string) => void;
}

const MAX_VISIBLE_TASKS = 3;

const QUICK_TOPIC_CHIPS: Array<{
  label: string;
  topic: string;
  level: UserLevel;
  duration: string;
  isPrimary?: boolean;
}> = [
  {
    label: '💡 머신러닝 & 딥러닝 4주 로드맵 뼈대 바로 잡기',
    topic: '머신러닝 & LLM 서비스 개발',
    level: 'BEGINNER',
    duration: '4주 정규 과정',
    isPrimary: true,
  },
  {
    label: '🐍 Python 기초 4주 완성',
    topic: 'Python 기초 4주 완성',
    level: 'BEGINNER',
    duration: '4주 정규 과정',
  },
  {
    label: '⚛️ React + TypeScript 실전',
    topic: 'React + TypeScript 실전',
    level: 'INTERMEDIATE',
    duration: '4주 정규 과정',
  },
  {
    label: '🗄️ SQL 데이터 분석 & 튜닝',
    topic: 'SQL 데이터 분석 & 쿼리 튜닝',
    level: 'BEGINNER',
    duration: '2주 단기 완성',
  },
  {
    label: '🎯 토익 850 단기 달성',
    topic: '토익 850 단기 달성',
    level: 'INTERMEDIATE',
    duration: '4주 정규 과정',
  },
];

interface PriorityRoadmapTask {
  roadmapId: string;
  roadmapTitle: string;
  chapterTitle: string;
  item: RoadmapItem;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  roadmaps,
  onTriggerQuickTopic,
  onUpdateItemStatus,
  onOpenStudyGuideFromDashboard,
}) => {
  const [isTasksExpanded, setIsTasksExpanded] = useState<boolean>(false);

  // 진행 중인(Active) 로드맵 기준 전체 달성률 계산
  const activeRoadmaps = roadmaps.filter((r) => !r.isArchived);
  const targetRoadmaps = activeRoadmaps.length > 0 ? activeRoadmaps : roadmaps;

  let totalTasks = 0;
  let completedTasks = 0;
  let inProgressTasks = 0;

  const pendingTasks: PriorityRoadmapTask[] = [];

  for (const roadmap of targetRoadmaps) {
    const stats = calculateRoadmapStats(roadmap);
    totalTasks += stats.totalItems;
    completedTasks += stats.doneItems;
    inProgressTasks += stats.inProgressItems;

    for (const chapter of roadmap.chapters) {
      for (const item of chapter.items) {
        if (item.status !== 'DONE') {
          pendingTasks.push({
            roadmapId: roadmap.id,
            roadmapTitle: roadmap.title,
            chapterTitle: chapter.title,
            item,
          });
        }
      }
    }
  }

  // 진행 중(IN_PROGRESS)인 태스크를 최우선으로 정렬하고, 그다음 순서대로 배치
  pendingTasks.sort((a, b) => {
    if (a.item.status === 'IN_PROGRESS' && b.item.status !== 'IN_PROGRESS') {
      return -1;
    }
    if (a.item.status !== 'IN_PROGRESS' && b.item.status === 'IN_PROGRESS') {
      return 1;
    }
    return 0;
  });

  const overallAchievementRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const visibleTasks = isTasksExpanded
    ? pendingTasks
    : pendingTasks.slice(0, MAX_VISIBLE_TASKS);
  const hiddenTaskCount = Math.max(
    0,
    pendingTasks.length - MAX_VISIBLE_TASKS
  );

  const primaryChip = QUICK_TOPIC_CHIPS[0];
  const subChips = QUICK_TOPIC_CHIPS.slice(1);

  return (
    <div
      className="space-y-4"
      aria-label="대시보드 3단 학습 요약 허브"
    >
      {/* ===================================================================
          1단 (상단 · 진척도 통계): 진행 중인 로드맵 전체 달성률 미니멀 프로그레스 바
         =================================================================== */}
      <Card
        padding="md"
        className="border-slate-200/90 bg-white/95 sm:px-6 sm:py-5 dark:border-slate-800 dark:bg-slate-900/95"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <Award className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                  진행 중인 로드맵 전체 달성률
                </h2>
                <Badge variant="brand">
                  진행 중 {activeRoadmaps.length}개 과정
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                전체 {totalTasks}개 학습 단원 중{' '}
                <strong className="font-semibold text-slate-700 dark:text-slate-200">
                  {completedTasks}개 완료
                </strong>
                {inProgressTasks > 0 && ` · ${inProgressTasks}개 집중 학습 중`}
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 self-end sm:self-auto">
            <span className="text-2xl font-extrabold tracking-tight text-brand-600 sm:text-3xl dark:text-brand-400">
              {overallAchievementRate}%
            </span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              달성
            </span>
          </div>
        </div>

        <div className="mt-3.5">
          <ProgressBar value={overallAchievementRate} size="md" />
        </div>
      </Card>

      {/* ===================================================================
          2단 (중단 · 원클릭 단축 칩): 추천 학습 주제 원클릭 AI 로드맵 즉시 생성
         =================================================================== */}
      <Card
        padding="md"
        className="border-brand-200/80 bg-gradient-to-r from-brand-50/70 via-white to-indigo-50/50 sm:px-6 sm:py-4 dark:border-brand-900/50 dark:from-brand-950/30 dark:via-slate-900 dark:to-indigo-950/20"
      >
        <div className="flex flex-col justify-between gap-3.5 lg:flex-row lg:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-2 py-0.5 text-[11px] font-bold text-white dark:bg-brand-500">
                <Sparkles className="h-3 w-3" />
                원클릭 빠른 시작
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                검색어 입력 없이 칩을 누르면 즉시 AI 로드맵이 자동 생성됩니다
              </span>
            </div>
          </div>

          {primaryChip && (
            <button
              type="button"
              onClick={() =>
                onTriggerQuickTopic(
                  primaryChip.topic,
                  primaryChip.level,
                  primaryChip.duration
                )
              }
              className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-brand-300 bg-white px-4 py-2 text-xs font-bold text-brand-700 shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand-500 hover:bg-brand-600 hover:text-white hover:shadow-md sm:text-sm lg:self-auto dark:border-brand-700 dark:bg-slate-900 dark:text-brand-300 dark:hover:bg-brand-500 dark:hover:text-white"
            >
              <Lightbulb className="h-4 w-4 shrink-0 text-amber-500 transition-colors group-hover:text-amber-200" />
              <span>{primaryChip.label}</span>
              <Sparkles className="h-3.5 w-3.5 shrink-0 opacity-80" />
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-brand-100/80 pt-3 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            인기 주제 바로 생성:
          </span>
          {subChips.map((chip) => (
            <button
              key={chip.topic}
              type="button"
              onClick={() =>
                onTriggerQuickTopic(chip.topic, chip.level, chip.duration)
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-brand-600"
            >
              <span>{chip.label}</span>
              <ArrowUpRight className="h-3 w-3 text-slate-400" />
            </button>
          ))}
        </div>
      </Card>

      {/* ===================================================================
          3단 (하단 · 최우선 태스크 리스트): 오늘의 미완료 학습 태스크 최대 3개 노출 + 더보기(View More)
         =================================================================== */}
      {pendingTasks.length > 0 && (
        <Card padding="md" className="space-y-3.5 sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400">
                <ListTodo className="h-4 w-4" />
              </span>
              <h2 className="text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                오늘의 최우선 미완료 학습 태스크
              </h2>
              <Badge variant="warning">남은 단원 {pendingTasks.length}건</Badge>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              진행 중인 로드맵에서 가장 먼저 공부해야 할 상위 3개 단원입니다
            </span>
          </div>

          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-slate-50/50 dark:divide-slate-800/80 dark:border-slate-800 dark:bg-slate-900/50">
            {visibleTasks.map(({ roadmapId, roadmapTitle, chapterTitle, item }) => {
              const isInProgress = item.status === 'IN_PROGRESS';
              return (
                <li
                  key={item.id}
                  className="flex flex-col justify-between gap-2.5 px-4 py-3 transition-colors hover:bg-white sm:flex-row sm:items-center dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onUpdateItemStatus(item.id, 'DONE')}
                      className="mt-0.5 shrink-0 text-slate-400 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                      title="클릭하여 학습 완료 처리"
                      aria-label={`${item.title} 완료 체크`}
                    >
                      {isInProgress ? (
                        <Clock className="h-5 w-5 text-amber-500" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            'rounded px-1.5 py-0.5 text-[10px] font-bold',
                            isInProgress
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                              : 'bg-brand-100 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300'
                          )}
                        >
                          {isInProgress ? '진행 중' : '최우선 대기'}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {roadmapTitle} · {chapterTitle}
                        </span>
                        {item.estimatedTime && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                            <Clock className="h-3 w-3" />
                            {item.estimatedTime}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {item.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-end gap-2 pl-8 sm:pl-0">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenStudyGuideFromDashboard(roadmapId, item.id)
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-brand-300 dark:hover:border-brand-500"
                    >
                      <span>학습 리포트 열기</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateItemStatus(item.id, 'DONE')}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50/70 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>완료</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* 3개 초과 항목 더보기 (View More) 토글 버튼 */}
          {pendingTasks.length > MAX_VISIBLE_TASKS && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={() => setIsTasksExpanded((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {isTasksExpanded ? (
                  <>
                    <span>상위 3개만 간략히 보기 (접기)</span>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <span>
                      더보기 (View More · 외 {hiddenTaskCount}건 미완료 단원)
                    </span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

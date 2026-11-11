import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Circle,
  StickyNote,
  BookOpen,
  ChevronDown,
  BookOpenCheck,
  Tag,
  Timer,
} from 'lucide-react';
import { Badge } from '@/components/common';
import { cn } from '@/utils/cn';
import type { ItemStatus, RoadmapItem } from '@/types';

export interface ItemRowProps {
  item: RoadmapItem;
  isMemoOpen?: boolean;
  onStatusChange: (itemId: string, nextStatus: ItemStatus) => void;
  onOpenMemo: (itemId: string) => void;
  onOpenStudyGuide: (itemId: string, keyword?: string) => void;
}

const NEXT_STATUS_CYCLE: Record<ItemStatus, ItemStatus> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: 'TODO',
};

const STATUS_OPTIONS: Array<{
  value: ItemStatus;
  label: string;
}> = [
  { value: 'TODO', label: '대기' },
  { value: 'IN_PROGRESS', label: '진행 중' },
  { value: 'DONE', label: '완료' },
];

export const ItemRow: React.FC<ItemRowProps> = ({
  item,
  isMemoOpen = false,
  onStatusChange,
  onOpenMemo,
  onOpenStudyGuide,
}) => {
  const [isGuideExpanded, setIsGuideExpanded] = useState<boolean>(
    item.status !== 'DONE'
  );
  const [checkedSubSteps, setCheckedSubSteps] = useState<Record<number, boolean>>(
    {}
  );

  const isDone = item.status === 'DONE';
  const isInProgress = item.status === 'IN_PROGRESS';
  const hasMemo = Boolean(item.memo && item.memo.trim().length > 0);
  const subTasks = item.subTasks ?? [];
  const keywords = item.keywords ?? [];
  const hasGranularDetails =
    Boolean(item.description) || subTasks.length > 0 || keywords.length > 0;

  const handleCycleStatus = () => {
    const next = NEXT_STATUS_CYCLE[item.status];
    onStatusChange(item.id, next);
  };

  const toggleSubStep = (index: number) => {
    setCheckedSubSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <li
      className={cn(
        'group rounded-2xl border p-4 transition-all duration-150 sm:p-5',
        isDone
          ? 'border-emerald-200/70 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20'
          : isInProgress
            ? 'border-amber-200/80 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/20'
            : 'border-slate-200/80 bg-white hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
        isMemoOpen && 'ring-2 ring-brand-500/40'
      )}
    >
      {/* Top Row: Main Title + Controls */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        {/* Left: Touch-friendly Interactive 3-state Checkbox + Title & Description */}
        <div className="flex items-start gap-3.5">
          <button
            type="button"
            onClick={handleCycleStatus}
            className={cn(
              'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-transform active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              isDone
                ? 'bg-emerald-500 text-white shadow-sm'
                : isInProgress
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'border border-slate-300 bg-slate-50 text-slate-400 hover:border-brand-500 hover:text-brand-500 dark:border-slate-700 dark:bg-slate-800'
            )}
            title="클릭하여 상태 변경 (대기 → 진행 중 → 완료)"
            aria-label={`${item.title} 상태 토글`}
          >
            {isDone ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : isInProgress ? (
              <Clock className="h-4 w-4" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
          </button>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => onOpenStudyGuide(item.id)}
                className="text-left focus:outline-none group/title"
                title="클릭하여 학습 가이드 보고서 열기"
              >
                <span
                  className={cn(
                    'text-base font-bold leading-snug transition-all duration-200 group-hover/title:text-brand-600 dark:group-hover/title:text-brand-400 sm:text-lg',
                    isDone
                      ? 'text-slate-400 line-through decoration-emerald-500/60 decoration-2 dark:text-slate-500'
                      : 'text-slate-900 dark:text-slate-100'
                  )}
                >
                  {item.title}
                </span>
              </button>

              {item.estimatedTime && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Timer className="h-3.5 w-3.5 text-brand-500" />
                  {item.estimatedTime}
                </span>
              )}
            </div>

            {item.description && (
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {item.description}
              </p>
            )}

            {/* Keywords Row */}
            {keywords.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                  <Tag className="h-3.5 w-3.5" />
                  핵심 키워드:
                </span>
                {keywords.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => onOpenStudyGuide(item.id, kw)}
                    title={`'${kw}' 개념 정리 보고서에서 보기`}
                    className="rounded-lg border border-brand-200/70 bg-brand-50/60 px-2.5 py-0.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-900/60 dark:bg-brand-950/50 dark:text-brand-300 dark:hover:bg-brand-900/60"
                  >
                    #{kw}
                  </button>
                ))}
              </div>
            )}

            {/* Study Guide Page Button & Sub-steps / Memo Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
              <button
                type="button"
                onClick={() => onOpenStudyGuide(item.id)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-brand-700 sm:text-sm dark:bg-brand-500 dark:hover:bg-brand-600"
              >
                <BookOpen className="h-4 w-4" />
                <span>학습 가이드 보고서 & 참고자료 보기</span>
              </button>

              {hasGranularDetails && subTasks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsGuideExpanded((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 sm:text-sm dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <BookOpenCheck className="h-4 w-4 text-brand-500" />
                  <span>
                    세부 공부 순서 ({subTasks.length}단계)
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform duration-150',
                      isGuideExpanded && 'rotate-180'
                    )}
                  />
                </button>
              )}

              {hasMemo && (
                <button
                  type="button"
                  onClick={() => onOpenMemo(item.id)}
                  className="inline-flex max-w-full items-center gap-1.5 truncate rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-500/20 hover:bg-amber-100 sm:max-w-md sm:text-sm dark:bg-amber-950/50 dark:text-amber-200"
                >
                  <StickyNote className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span className="truncate">{item.memo}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: 3-State Segmented Switch & Memo Trigger */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-100 pt-3 sm:justify-end sm:border-t-0 sm:pt-0 dark:border-slate-800/80">
          <div
            className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-800/80"
            role="group"
            aria-label="학습 상태 선택"
          >
            {STATUS_OPTIONS.map((option) => {
              const active = item.status === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onStatusChange(item.id, option.value)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors',
                    active
                      ? option.value === 'DONE'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : option.value === 'IN_PROGRESS'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => onOpenMemo(item.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors',
              hasMemo
                ? 'border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950/60 dark:text-brand-300'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
            )}
            title="학습 메모 및 참고 링크 작성"
          >
            <StickyNote className="h-3.5 w-3.5" />
            <span>{hasMemo ? '메모 보기' : '메모'}</span>
            {hasMemo && (
              <Badge variant="brand" className="ml-0.5 px-1.5 py-0 text-[10px]">
                기록됨
              </Badge>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Step-by-Step Micro Study Guide */}
      {isGuideExpanded && subTasks.length > 0 && (
        <div className="mt-4 ml-0 rounded-xl border border-slate-200/70 bg-slate-50/80 p-4 sm:ml-11 dark:border-slate-800 dark:bg-slate-950/60">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
              <BookOpenCheck className="h-4 w-4 text-brand-500" />
              단계별 세부 공부 순서 (클릭하여 체크)
            </p>
            <button
              type="button"
              onClick={() => onOpenStudyGuide(item.id)}
              className="text-xs font-bold text-brand-600 hover:underline dark:text-brand-400"
            >
              추천 참고자료 & 예제 보기 →
            </button>
          </div>
          <ul className="space-y-2">
            {subTasks.map((stepText, idx) => {
              const isSubDone = isDone || Boolean(checkedSubSteps[idx]);
              return (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => toggleSubStep(idx)}
                    className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-white dark:hover:bg-slate-900"
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition-colors',
                        isSubDone
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      )}
                    >
                      {isSubDone ? '✓' : idx + 1}
                    </span>
                    <span
                      className={cn(
                        'leading-relaxed',
                        isSubDone
                          ? 'text-slate-400 line-through dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      )}
                    >
                      {stepText}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
};

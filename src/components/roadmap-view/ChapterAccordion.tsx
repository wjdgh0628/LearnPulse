import React, { useState } from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { Badge, Card, ProgressBar } from '@/components/common';
import { ItemRow } from '@/components/roadmap-view/ItemRow';
import { cn } from '@/utils/cn';
import type { ItemStatus, RoadmapChapter } from '@/types';

export interface ChapterAccordionProps {
  chapter: RoadmapChapter;
  defaultOpen?: boolean;
  activeMemoItemId: string | null;
  onStatusChange: (itemId: string, nextStatus: ItemStatus) => void;
  onOpenMemo: (itemId: string) => void;
  onOpenStudyGuide: (itemId: string, keyword?: string) => void;
}

export const ChapterAccordion: React.FC<ChapterAccordionProps> = ({
  chapter,
  defaultOpen = true,
  activeMemoItemId,
  onStatusChange,
  onOpenMemo,
  onOpenStudyGuide,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  const totalCount = chapter.items.length;
  const doneCount = chapter.items.filter((i) => i.status === 'DONE').length;
  const isChapterComplete = totalCount > 0 && doneCount === totalCount;
  const chapterPercent =
    totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 bg-white p-5 text-left transition-colors hover:bg-slate-50/80 focus:outline-none dark:bg-slate-900 dark:hover:bg-slate-800/50"
      >
        <div className="flex items-start gap-3.5">
          <div
            className={cn(
              'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors',
              isChapterComplete
                ? 'bg-emerald-500 text-white'
                : 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
            )}
          >
            {isChapterComplete ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              chapter.orderIndex
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {chapter.title}
              </h2>
              <Badge variant={isChapterComplete ? 'success' : 'outline'}>
                {doneCount}/{totalCount} 완료 ({chapterPercent}%)
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {chapter.description}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden w-24 sm:block">
            <ProgressBar value={chapterPercent} size="sm" />
          </div>
          <ChevronDown
            className={cn(
              'h-5 w-5 text-slate-400 transition-transform duration-200',
              isOpen && 'rotate-180 text-brand-600 dark:text-brand-400'
            )}
          />
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <ul className="space-y-2.5">
            {chapter.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                isMemoOpen={activeMemoItemId === item.id}
                onStatusChange={onStatusChange}
                onOpenMemo={onOpenMemo}
                onOpenStudyGuide={onOpenStudyGuide}
              />
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

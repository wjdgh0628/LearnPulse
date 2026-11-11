import React from 'react';
import {
  Calendar,
  Clock,
  Archive,
  ArchiveRestore,
  Trash2,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import { Card, Badge, Button, ProgressBar } from '@/components/common';
import {
  calculateRoadmapStats,
  formatDateShort,
  formatLevelLabel,
  getLevelBadgeVariant,
} from '@/utils/formatters';
import type { Roadmap } from '@/types';

export interface RoadmapCardProps {
  roadmap: Roadmap;
  isSelected?: boolean;
  onSelect: (roadmapId: string) => void;
  onToggleArchive: (roadmapId: string, nextArchived: boolean) => void;
  onDelete: (roadmapId: string) => void;
}

export const RoadmapCard: React.FC<RoadmapCardProps> = ({
  roadmap,
  isSelected = false,
  onSelect,
  onToggleArchive,
  onDelete,
}) => {
  const stats = calculateRoadmapStats(roadmap);

  return (
    <Card
      hoverable
      padding="md"
      className={
        isSelected
          ? 'flex flex-col justify-between border-brand-500 ring-2 ring-brand-500/20 dark:border-brand-500'
          : 'flex flex-col justify-between'
      }
    >
      <div className="space-y-3">
        {/* Top Metadata Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={getLevelBadgeVariant(roadmap.level)}>
              {formatLevelLabel(roadmap.level)}
            </Badge>
            <Badge variant="outline">
              <Clock className="mr-1 h-3 w-3" />
              {roadmap.targetDuration}
            </Badge>
            {roadmap.isArchived && <Badge variant="default">보관됨</Badge>}
          </div>

          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <Calendar className="h-3 w-3" />
            {formatDateShort(roadmap.createdAt)}
          </span>
        </div>

        {/* Title & Summary */}
        <div>
          <button
            type="button"
            onClick={() => onSelect(roadmap.id)}
            className="group flex w-full items-start justify-between gap-2 text-left focus:outline-none"
          >
            <h3 className="line-clamp-1 text-lg font-bold text-slate-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
              {roadmap.title}
            </h3>
            <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600 dark:group-hover:text-brand-400" />
          </button>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            {roadmap.summary}
          </p>
        </div>
      </div>

      {/* Progress & Action Footer */}
      <div className="mt-5 space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800/80">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
              <Layers className="h-3.5 w-3.5 text-brand-500" />
              {roadmap.chapters.length}개 챕터 · {stats.doneItems}/{stats.totalItems} 완료
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {stats.percentage}%
            </span>
          </div>
          <ProgressBar value={stats.percentage} size="sm" />
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => onSelect(roadmap.id)}
          >
            학습 체크리스트 열기
          </Button>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleArchive(roadmap.id, !roadmap.isArchived)}
              title={roadmap.isArchived ? '보관 해제' : '보관함으로 이동'}
              aria-label={roadmap.isArchived ? '보관 해제' : '보관함으로 이동'}
            >
              {roadmap.isArchived ? (
                <ArchiveRestore className="h-4 w-4" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
              onClick={() => onDelete(roadmap.id)}
              title="로드맵 삭제"
              aria-label="로드맵 삭제"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Archive,
  ArchiveRestore,
  Layers,
  CheckCircle2,
  PlayCircle,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { Badge, Button, Card, ProgressBar } from '@/components/common';
import {
  calculateRoadmapStats,
  formatDateShort,
  formatLevelLabel,
  getLevelBadgeVariant,
} from '@/utils/formatters';
import {
  copyRoadmapMarkdownToClipboard,
  downloadRoadmapMarkdownFile,
} from '@/utils/exportMarkdown';
import type { Roadmap } from '@/types';

export interface RoadmapHeaderProps {
  roadmap: Roadmap;
  allRoadmaps: Roadmap[];
  onBackToList: () => void;
  onSelectRoadmap: (roadmapId: string) => void;
  onToggleArchive: (roadmapId: string, nextArchived: boolean) => void;
}

export const RoadmapHeader: React.FC<RoadmapHeaderProps> = ({
  roadmap,
  allRoadmaps,
  onBackToList,
  onSelectRoadmap,
  onToggleArchive,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const stats = calculateRoadmapStats(roadmap);

  const handleCopyMarkdown = async () => {
    const ok = await copyRoadmapMarkdownToClipboard(roadmap);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadMarkdown = () => {
    downloadRoadmapMarkdownFile(roadmap);
  };

  return (
    <div className="space-y-4">
      {/* Multi-Roadmap Quick Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={onBackToList}
        >
          보관함 목록으로 돌아가기
        </Button>

        {allRoadmaps.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              로드맵 빠른 전환:
            </span>
            {allRoadmaps.map((item) => {
              const isCurrent = item.id === roadmap.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectRoadmap(item.id)}
                  className={
                    isCurrent
                      ? 'rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm dark:bg-brand-500'
                      : 'rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                  }
                >
                  {item.title}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Header Card */}
      <Card padding="lg" className="space-y-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getLevelBadgeVariant(roadmap.level)}>
                {formatLevelLabel(roadmap.level)}
              </Badge>
              <Badge variant="outline">
                <Clock className="mr-1 h-3 w-3" />
                {roadmap.targetDuration}
              </Badge>
              <Badge variant="outline">
                <Calendar className="mr-1 h-3 w-3" />
                {formatDateShort(roadmap.createdAt)} 생성
              </Badge>
              {roadmap.isArchived && <Badge variant="warning">보관됨</Badge>}
            </div>

            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
              {roadmap.title}
            </h1>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {roadmap.summary}
            </p>
          </div>

          {/* Export & Lifecycle Actions */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={
                copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )
              }
              onClick={() => void handleCopyMarkdown()}
            >
              {copied ? '마크다운 복사됨!' : '마크다운 복사'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={handleDownloadMarkdown}
            >
              .md 다운로드
            </Button>

            <Button
              variant="secondary"
              size="sm"
              leftIcon={
                roadmap.isArchived ? (
                  <ArchiveRestore className="h-4 w-4" />
                ) : (
                  <Archive className="h-4 w-4" />
                )
              }
              onClick={() => onToggleArchive(roadmap.id, !roadmap.isArchived)}
            >
              {roadmap.isArchived ? '보관 해제' : '아카이브'}
            </Button>
          </div>
        </div>

        {/* Progress Bar & Status Breakdown */}
        <div className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                <Layers className="h-4 w-4 text-brand-500" />총 {roadmap.chapters.length}개 챕터 ({stats.totalItems}개 항목)
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                완료 {stats.doneItems}
              </span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <PlayCircle className="h-3.5 w-3.5" />
                진행 중 {stats.inProgressItems}
              </span>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              달성률 {stats.percentage}%
            </span>
          </div>

          <ProgressBar value={stats.percentage} size="md" />
        </div>
      </Card>
    </div>
  );
};

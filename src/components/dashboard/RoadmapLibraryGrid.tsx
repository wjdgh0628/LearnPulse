import React, { useState } from 'react';
import {
  Compass,
  Plus,
  FolderKanban,
  Archive,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { Button, Card, Modal } from '@/components/common';
import { RoadmapCard } from '@/components/dashboard/RoadmapCard';
import { cn } from '@/utils/cn';
import type { LibraryFilter } from '@/stores/useRoadmapStore';
import type { Roadmap } from '@/types';

export interface RoadmapLibraryGridProps {
  roadmaps: Roadmap[];
  selectedRoadmapId: string | null;
  filter: LibraryFilter;
  onChangeFilter: (filter: LibraryFilter) => void;
  onSelectRoadmap: (roadmapId: string) => void;
  onToggleArchive: (roadmapId: string, nextArchived: boolean) => void;
  onDeleteRoadmap: (roadmapId: string) => void;
  onOpenCreator: () => void;
}

export const RoadmapLibraryGrid: React.FC<RoadmapLibraryGridProps> = ({
  roadmaps,
  selectedRoadmapId,
  filter,
  onChangeFilter,
  onSelectRoadmap,
  onToggleArchive,
  onDeleteRoadmap,
  onOpenCreator,
}) => {
  const [pendingDeleteRoadmap, setPendingDeleteRoadmap] = useState<Roadmap | null>(
    null
  );

  const activeCount = roadmaps.filter((r) => !r.isArchived).length;
  const archivedCount = roadmaps.filter((r) => r.isArchived).length;

  const filteredRoadmaps = roadmaps.filter((r) => {
    if (filter === 'ACTIVE') return !r.isArchived;
    if (filter === 'ARCHIVED') return r.isArchived;
    return true;
  });

  const filterTabs: Array<{
    id: LibraryFilter;
    label: string;
    count: number;
    icon: React.ReactNode;
  }> = [
    {
      id: 'ACTIVE',
      label: '진행 중',
      count: activeCount,
      icon: <FolderKanban className="h-4 w-4" />,
    },
    {
      id: 'ARCHIVED',
      label: '아카이브됨',
      count: archivedCount,
      icon: <Archive className="h-4 w-4" />,
    },
    {
      id: 'ALL',
      label: '전체 보기',
      count: roadmaps.length,
      icon: <Layers className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Filter Bar & Quick Switcher (중복 로드맵 생성 버튼 제거됨) */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          {filterTabs.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeFilter(tab.id)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm dark:bg-brand-500'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.2 text-[11px]',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards Grid */}
      {filteredRoadmaps.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filteredRoadmaps.map((roadmap) => (
            <RoadmapCard
              key={roadmap.id}
              roadmap={roadmap}
              isSelected={selectedRoadmapId === roadmap.id}
              onSelect={onSelectRoadmap}
              onToggleArchive={onToggleArchive}
              onDelete={() => setPendingDeleteRoadmap(roadmap)}
            />
          ))}
        </div>
      ) : (
        <Card padding="lg" className="border-dashed text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <Compass className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
            {filter === 'ARCHIVED'
              ? '아카이브된 로드맵이 없습니다'
              : '진행 중인 학습 로드맵이 없습니다'}
          </h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
            새로운 학습 주제를 입력하여 AI 맞춤형 단계별 로드맵을 생성하고 내 보관함에 등록해 보세요.
          </p>
          <div className="mt-5 flex justify-center">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={onOpenCreator}
            >
              로드맵 생성기로 이동
            </Button>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={pendingDeleteRoadmap !== null}
        onClose={() => setPendingDeleteRoadmap(null)}
        title="로드맵 삭제 확인"
        description="삭제된 로드맵과 체크리스트 학습 기록은 복구할 수 없습니다."
        maxWidth="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPendingDeleteRoadmap(null)}
            >
              취소
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (pendingDeleteRoadmap) {
                  onDeleteRoadmap(pendingDeleteRoadmap.id);
                  setPendingDeleteRoadmap(null);
                }
              }}
            >
              영구 삭제
            </Button>
          </>
        }
      >
        {pendingDeleteRoadmap && (
          <div className="flex items-start gap-3 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-800 dark:bg-rose-950/50 dark:text-rose-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-semibold">{pendingDeleteRoadmap.title}</p>
              <p className="mt-0.5 opacity-90">
                이 로드맵의 모든 챕터({pendingDeleteRoadmap.chapters.length}개)와 작성된 메모가 삭제됩니다.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

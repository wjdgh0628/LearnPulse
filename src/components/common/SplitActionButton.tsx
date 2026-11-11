import React from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SplitActionButtonProps {
  onAICreate: () => void;
  onManualCreate: () => void;
  className?: string;
}

export const SplitActionButton: React.FC<SplitActionButtonProps> = ({
  onAICreate,
  onManualCreate,
  className,
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-stretch overflow-hidden rounded-xl bg-brand-600 text-white shadow-sm ring-1 ring-brand-700/20 transition-all hover:shadow-md dark:bg-brand-500 dark:ring-brand-400/20',
        className
      )}
      role="group"
      aria-label="로드맵 생성 액션 버튼"
    >
      {/* 좌측 메인 영역: ✨ AI로 로드맵 생성 */}
      <button
        type="button"
        onClick={onAICreate}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold tracking-tight text-white transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 sm:px-4 sm:text-sm dark:hover:bg-brand-600"
      >
        <Sparkles className="h-4 w-4 shrink-0 text-amber-200" />
        <span>AI로 로드맵 생성</span>
      </button>

      {/* 우측 서브 영역: ➕ 아이콘 단독 (1-Depth 수동 생성 팝업 즉시 오픈) */}
      <button
        type="button"
        onClick={onManualCreate}
        className="inline-flex items-center justify-center border-l border-white/25 bg-brand-700/40 px-2.5 py-2 text-white transition-colors hover:bg-brand-800/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 sm:px-3 dark:border-white/20 dark:bg-brand-600/50 dark:hover:bg-brand-700"
        title="수동으로 새 로드맵 직접 만들기"
        aria-label="수동 로드맵 생성 팝업 열기"
      >
        <Plus className="h-4 w-4 shrink-0 stroke-[2.5]" />
      </button>
    </div>
  );
};

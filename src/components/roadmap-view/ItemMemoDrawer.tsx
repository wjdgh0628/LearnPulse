import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  StickyNote,
  Link2,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Save,
} from 'lucide-react';
import { Badge, Button, Input } from '@/components/common';
import type { RoadmapItem } from '@/types';

export interface ItemMemoDrawerProps {
  item: RoadmapItem | null;
  chapterTitle?: string;
  onClose: () => void;
  onSaveMemo: (itemId: string, memo: string, referenceLink: string) => void;
}

export const ItemMemoDrawer: React.FC<ItemMemoDrawerProps> = ({
  item,
  chapterTitle,
  onClose,
  onSaveMemo,
}) => {
  const [memoText, setMemoText] = useState<string>('');
  const [referenceLink, setReferenceLink] = useState<string>('');
  const [saveState, setSaveState] = useState<'IDLE' | 'SAVING' | 'SAVED'>('IDLE');
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (item) {
      setMemoText(item.memo ?? '');
      setReferenceLink(item.referenceLink ?? '');
      setSaveState('IDLE');
    }
  }, [item?.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && item) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  if (!item) return null;

  const scheduleAutoSave = (nextMemo: string, nextLink: string) => {
    setSaveState('SAVING');
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }

    const currentItemId = item.id;
    debounceTimerRef.current = window.setTimeout(() => {
      onSaveMemo(currentItemId, nextMemo, nextLink);
      setSaveState('SAVED');
    }, 450);
  };

  const handleManualSave = () => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }
    onSaveMemo(item.id, memoText, referenceLink);
    setSaveState('SAVED');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="학습 메모 및 레퍼런스 링크 편집"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side Sheet Panel */}
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col justify-between border-l border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Top Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Learning Note & Reference
                </span>
              </div>
              {chapterTitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {chapterTitle}
                </p>
              )}
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {item.title}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="드로어 닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Auto-Save Status Indicator */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2 text-xs dark:bg-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400">
              입력 시 자동 저장(Debounce)이 적용됩니다.
            </span>
            {saveState === 'SAVING' ? (
              <Badge variant="warning">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                자동 저장 중...
              </Badge>
            ) : saveState === 'SAVED' ? (
              <Badge variant="success">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                저장 완료
              </Badge>
            ) : (
              <Badge variant="outline">동기화됨</Badge>
            )}
          </div>

          {/* Reference Link Field */}
          <div className="space-y-2">
            <Input
              label="참고 URL 링크 (공식 문서 / 블로그 / 강의)"
              placeholder="https://docs.python.org/ko/3/..."
              value={referenceLink}
              onChange={(e) => {
                const nextLink = e.target.value;
                setReferenceLink(nextLink);
                scheduleAutoSave(memoText, nextLink);
              }}
              leftAddon={<Link2 className="h-4 w-4" />}
              helperText="자주 참고할 문서나 정리한 노션/블로그 주소를 입력해 두세요."
            />

            {referenceLink.trim().startsWith('http') && (
              <a
                href={referenceLink.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                <span>새 탭에서 링크 열기</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {/* Memo Textarea */}
          <div className="space-y-2">
            <label
              htmlFor="item-memo-textarea"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              핵심 학습 요약 노트
            </label>
            <textarea
              id="item-memo-textarea"
              rows={9}
              value={memoText}
              onChange={(e) => {
                const nextMemo = e.target.value;
                setMemoText(nextMemo);
                scheduleAutoSave(nextMemo, referenceLink);
              }}
              placeholder="이 항목을 공부하면서 배운 핵심 개념, 코드 스니펫, 혹은 헷갈렸던 포인트를 자유롭게 기록하세요."
              className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            닫기
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={handleManualSave}
          >
            지금 저장
          </Button>
        </div>
      </aside>
    </div>
  );
};

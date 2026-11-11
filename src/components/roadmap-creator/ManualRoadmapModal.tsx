import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FolderPlus } from 'lucide-react';
import { Button, Input, Modal } from '@/components/common';
import type { ManualModalPrefill } from '@/stores/useRoadmapStore';
import type { CreateRoadmapPayload, UserLevel } from '@/types';

export interface ManualRoadmapModalProps {
  isOpen: boolean;
  prefill?: ManualModalPrefill | null;
  onClose: () => void;
  onSaveRoadmap: (payload: CreateRoadmapPayload) => Promise<void>;
}

const LEVEL_OPTIONS: Array<{ value: UserLevel; label: string }> = [
  { value: 'BEGINNER', label: '입문 (Beginner)' },
  { value: 'INTERMEDIATE', label: '중급 (Intermediate)' },
  { value: 'ADVANCED', label: '심화 (Advanced)' },
];

const DURATION_OPTIONS: string[] = [
  '2주 단기 완성',
  '4주 정규 과정',
  '8주 심화 마스터',
];

export const ManualRoadmapModal: React.FC<ManualRoadmapModalProps> = ({
  isOpen,
  prefill,
  onClose,
  onSaveRoadmap,
}) => {
  const [title, setTitle] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [level, setLevel] = useState<UserLevel>('BEGINNER');
  const [targetDuration, setTargetDuration] = useState<string>('4주 정규 과정');
  const [chapterTitle, setChapterTitle] = useState<string>(
    '1단계: 핵심 목표 및 필수 실행 과제'
  );
  const [taskTitles, setTaskTitles] = useState<string[]>([
    '기초 개념 정리 및 실습 환경 세팅',
    '핵심 문법/원리 예제 직접 구현하기',
    '미니 과제 완주 및 3줄 회고 노트 작성',
  ]);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    if (prefill) {
      setTitle(
        prefill.title ??
          (prefill.topic ? `${prefill.topic} 실전 로드맵` : '')
      );
      setTopic(prefill.topic ?? '');
      if (prefill.initialTask) {
        setTaskTitles([
          prefill.initialTask,
          '관련 핵심 개념 및 공식 레퍼런스 확인',
          '실습 예제 검증 및 결과 요약 기록',
        ]);
      }
    } else {
      setTitle('');
      setTopic('');
      setChapterTitle('1단계: 핵심 목표 및 필수 실행 과제');
      setTaskTitles([
        '기초 개념 정리 및 실습 환경 세팅',
        '핵심 문법/원리 예제 직접 구현하기',
        '미니 과제 완주 및 3줄 회고 노트 작성',
      ]);
    }
  }, [isOpen, prefill]);

  const handleAddTaskRow = () => {
    setTaskTitles((prev) => [...prev, '']);
  };

  const handleRemoveTaskRow = (idx: number) => {
    if (taskTitles.length <= 2) return;
    setTaskTitles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleChangeTaskRow = (idx: number, val: string) => {
    setTaskTitles((prev) => prev.map((item, i) => (i === idx ? val : item)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedTopic = topic.trim() || trimmedTitle;
    const validTasks = taskTitles.map((t) => t.trim()).filter(Boolean);

    if (trimmedTitle.length < 2) {
      setError('로드맵 제목을 2글자 이상 입력해 주세요.');
      return;
    }
    if (validTasks.length < 2) {
      setError('최소 2개 이상의 세부 학습 태스크를 입력해 주세요.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onSaveRoadmap({
        title: trimmedTitle,
        topic: trimmedTopic,
        level,
        targetDuration,
        summary: `'${trimmedTopic}' 주제를 중심으로 직접 설계한 맞춤형 수동 학습 로드맵입니다.`,
        chapters: [
          {
            title: chapterTitle.trim() || '1단계: 핵심 목표 및 필수 실행 과제',
            description: '직접 구성한 최우선 학습 체크리스트입니다.',
            items: validTasks.map((taskText) => ({
              title: taskText,
              description: `'${trimmedTopic}' 달성을 위한 핵심 실행 항목입니다.`,
              subTasks: [
                `Step 1 (개념 파악): ${taskText} 핵심 요구사항 확인`,
                `Step 2 (직접 실습): 기본 예제 및 동작 검증`,
                `Step 3 (요약 기록): 핵심 포인트 3줄 노트 정리`,
              ],
              keywords: [trimmedTopic, '핵심 원리', '실전 적용'],
              estimatedTime: '45분',
            })),
          },
        ],
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="수동 로드맵 빠른 만들기"
      description="우측 상단 ➕ 버튼으로 바로 열리는 1-Depth 직접 생성 창입니다."
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            leftIcon={<FolderPlus className="h-4 w-4" />}
            onClick={(e) => void handleSubmit(e)}
          >
            보관함에 즉시 생성
          </Button>
        </>
      }
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="로드맵 제목"
            placeholder="예: 백엔드 면접 & CS 핵심 정리"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
          />
          <Input
            label="핵심 주제 (Topic)"
            placeholder="예: CS 전공, Python, SQL"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              목표 난이도
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as UserLevel)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              {LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              목표 기간
            </label>
            <select
              value={targetDuration}
              onChange={(e) => setTargetDuration(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              {DURATION_OPTIONS.map((dur) => (
                <option key={dur} value={dur}>
                  {dur}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="첫 번째 챕터명"
          value={chapterTitle}
          onChange={(e) => setChapterTitle(e.target.value)}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              세부 학습 태스크 (체크리스트 항목)
            </label>
            <button
              type="button"
              onClick={handleAddTaskRow}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>항목 추가</span>
            </button>
          </div>

          <div className="space-y-2">
            {taskTitles.map((task, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={task}
                  onChange={(e) => handleChangeTaskRow(idx, e.target.value)}
                  placeholder={`학습할 세부 태스크 ${idx + 1} 입력`}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                />
                {taskTitles.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTaskRow(idx)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                    aria-label="항목 삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-rose-50 px-3.5 py-2 text-xs font-medium text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
};

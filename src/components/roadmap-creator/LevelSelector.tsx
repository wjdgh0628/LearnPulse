import React from 'react';
import { Sprout, Flame, Trophy } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { UserLevel } from '@/types';

export interface LevelSelectorProps {
  value: UserLevel;
  onChange: (level: UserLevel) => void;
  disabled?: boolean;
}

interface LevelOption {
  value: UserLevel;
  label: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
}

const LEVEL_OPTIONS: LevelOption[] = [
  {
    value: 'BEGINNER',
    label: '입문 (Beginner)',
    badge: '기초 개념부터',
    description: '해당 분야를 처음 접하며 필수 용어와 환경 구축부터 차근차근 시작합니다.',
    icon: <Sprout className="h-5 w-5" />,
  },
  {
    value: 'INTERMEDIATE',
    label: '중급 (Intermediate)',
    badge: '실전 응용 중심',
    description: '기본 문법과 개념은 알고 있으며 실전 프로젝트 적용과 활용법을 익힙니다.',
    icon: <Flame className="h-5 w-5" />,
  },
  {
    value: 'ADVANCED',
    label: '심화 (Advanced)',
    badge: '아키텍처 & 최적화',
    description: '고난도 문제 해결, 내부 동작 원리, 성능 튜닝 및 실무 설계를 목표로 합니다.',
    icon: <Trophy className="h-5 w-5" />,
  },
];

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        현재 배경지식 수준 선택
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {LEVEL_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                'flex flex-col items-start rounded-xl border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50',
                isSelected
                  ? 'border-brand-600 bg-brand-50/70 ring-1 ring-brand-600 dark:border-brand-500 dark:bg-brand-950/50 dark:ring-brand-500'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg',
                    isSelected
                      ? 'bg-brand-600 text-white dark:bg-brand-500'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  )}
                >
                  {option.icon}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-medium',
                    isSelected
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  )}
                >
                  {option.badge}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                {option.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

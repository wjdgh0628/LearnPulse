import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface DurationPickerProps {
  value: string;
  onChange: (duration: string) => void;
  disabled?: boolean;
}

interface DurationOption {
  value: string;
  label: string;
  pace: string;
}

const DURATION_OPTIONS: DurationOption[] = [
  {
    value: '2주 단기 완성',
    label: '2주 단기 완성',
    pace: '주 10~12시간 · 핵심 요약 집중',
  },
  {
    value: '4주 정규 과정',
    label: '4주 정규 과정',
    pace: '주 6~8시간 · 이론 + 실습 밸런스',
  },
  {
    value: '8주 심화 완성',
    label: '8주 심화 완성',
    pace: '주 4~6시간 · 미니 프로젝트 포함',
  },
];

export const DurationPicker: React.FC<DurationPickerProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        목표 학습 기간 선택
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {DURATION_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                'flex items-center justify-between rounded-xl border p-3.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50',
                isSelected
                  ? 'border-brand-600 bg-brand-50/70 ring-1 ring-brand-600 dark:border-brand-500 dark:bg-brand-950/50 dark:ring-brand-500'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar
                    className={cn(
                      'h-4 w-4',
                      isSelected
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-slate-400 dark:text-slate-500'
                    )}
                  />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {option.label}
                  </span>
                </div>
                <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>{option.pace}</span>
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
